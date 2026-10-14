/* ---------- Helpers ---------- */
function playSound(sound) {
    sound.currentTime = 0;
    sound.volume = .5;
    sound.playbackRate = 1.3;
    sound.play()?.catch(function() {});
}

function getMealById(id) {
    return allMeals.find(meal => meal.id == id);
}

function getMealsOfCategory(category) {
    return menuByCategory[category];
}

function getMealBox() {
    return document.querySelector('.modal-layer[data-modal="meal"] .block-box');
}


/* ---------- Hero slider ---------- */
function updateActiveDot(slide) {
    const oldDot = heroSlider.querySelector(".slider-dots li.active");
    const newDot = heroSlider.querySelector(`[data-dot='${slide.dataset.slideId}']`);
    oldDot.classList.remove("active");
    newDot.classList.add("active");
    oldDot.firstElementChild.style.width = "0%";
    dotProgressWidth = 0;
    slideCounter = 0;
}

function updateSlide(oldSlide, newSlide) {
    oldSlide.classList.remove("active");
    newSlide.classList.add("active", "clicked");
    setTimeout(function() {
        newSlide.classList.remove("clicked");
    }, 500);
    updateActiveDot(newSlide);
}

function goToSlide(dot) {
    if (dot.classList.contains("active")) return;
    const oldSlide = heroSlider.querySelector(".hero-slide.active");
    const newSlide = heroSlider.querySelector(`[data-slide-id='${dot.dataset.dot}']`);
    updateSlide(oldSlide, newSlide);
    playSound(cameraSound);
}

function changeSlide(direction) {
    const current = heroSlider.querySelector(".hero-slide.active");
    if (current.classList.contains("clicked")) return;
    const target = direction == "next"
        ? current.nextElementSibling ?? sliderTrack.firstElementChild
        : current.previousElementSibling ?? sliderTrack.lastElementChild;
    updateSlide(current, target);
    playSound(cameraSound);
}

function updateDotProgress() {
    const activeDot = heroSlider.querySelector(".slider-dots li.active");
    const currentSlide = heroSlider.querySelector(`[data-slide-id='${activeDot.dataset.dot}']`);
    const nextSlide = currentSlide.nextElementSibling ?? sliderTrack.firstElementChild;
    slideDuration = currentSlide.dataset.delay ?? defaultSlideDuration;
    dotProgressWidth += intervalTime / (slideDuration / intervalTime);
    activeDot.firstElementChild.style.width = `${dotProgressWidth}%`;
    slideCounter += intervalTime;
    slideCounter == slideDuration && updateSlide(currentSlide, nextSlide);
}


/* ---------- Modals ---------- */
function openModal(name) {
    const modal = document.querySelector(`.modal-layer[data-modal="${name}"]`);
    modal.classList.remove("show");
    if (name == "booking") {
        clearForm(modal.querySelector("form .form-reset i"));
    }
    modal.classList.add("active", "clicked");
    modal.scrollTo(0, 0);
    setTimeout(function() {
        modal.classList.remove("clicked");
    }, 600);
    setTimeout(function() {
        modal.classList.add("show");
    }, 1);
}

function closeModal(callback) {
    const modal = document.querySelector(".modal-layer.active");
    if (!modal || modal.classList.contains("clicked")) return;
    modal.classList.remove("show");
    setTimeout(function() {
        modal.classList.remove("active");
        callback?.();
    }, 600);
}


/* ---------- Navbar & scrolling ---------- */
function scrollToSection(link) {
    const target = document.querySelector(link.getAttribute("href"));
    window.scrollTo(0, target.offsetTop);
}

function checkNavOnScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
}

function checkSliderInView() {
    heroSlider.classList.toggle("in-view", window.scrollY < heroSlider.offsetHeight);
}

function setLinkActive(link, isActive) {
    const dot = link.previousElementSibling;
    link.classList.toggle("active", isActive);
    dot?.classList.contains("dot-square") && dot.classList.toggle("d-none", !isActive);
}

function updateActiveLink(section) {
    const top = section.offsetTop - 10;
    const bottom = top + section.offsetHeight;
    if (window.scrollY > top && window.scrollY < bottom) {
        document.querySelectorAll(".nav-links ul li a.nav-link-item.active").forEach(link => setLinkActive(link, false));
        document.querySelectorAll(`.nav-links ul li a.nav-link-item[href="#${section.id}"]`).forEach(link => setLinkActive(link, true));
    }
}


/* ---------- Menu ---------- */
function buildMealHtml(meal, index) {
    return `
        <div class="meal row mx-0 align-items-center" style="transition-delay: ${+(index * .3).toFixed(1)}s;">
            <div class="col-4 col-lg-3 flex-center p-0">
                <div class="frame flex-center">
                    <div class="meal-img" style='background-image: url("${imageUrl(meal.images[0])}");'></div>
                    <div class="layout flex-center fs-4 text-black">
                        <i class="fa-regular fa-square-plus" onclick="showMealModal(${meal.id})"></i>
                    </div>
                </div>
            </div>

            <div class="col-8 col-lg-9">
                <div class="description text-light">
                    <div class="d-flex flex-column flex-sm-row align-items-sm-center column-gap-3 mb-2">
                        <h5 class="meal-name m-0 accent-color">${meal.name}</h5>
                        <div class="separator d-none d-sm-block"></div>
                        <h5 class="meal-price m-0 accent-color">$${meal.price.toFixed(2)}</h5>
                    </div>
                    <p class="muted-color mb-0" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip" data-bs-title="Tap the + for the full details.">
                        ${meal.description.slice(0, 65)}...
                    </p>
                </div>
            </div>
        </div>
    `;
}

function showAllMeals(meals) {
    const leftColumn = document.querySelector(".meals-list .row .col-left .block-item");
    const rightColumn = document.querySelector(".meals-list .row .col-right .block-item");
    const half = Math.ceil(meals.length / 2);
    const html = meals.map(buildMealHtml);
    leftColumn.innerHTML = html.slice(0, half).join("");
    rightColumn.innerHTML = html.slice(half).join("");
    try {
        window.bootstrap && document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
    } catch (e) {}
}

function setActiveTab(tab, force = false) {
    const activeTab = tab.closest(".menu-tabs").querySelector(".menu-tab.active");
    const mealsList = menuBody.querySelector(".meals-list");
    activeTab.classList.remove("active");
    tab.classList.add("active");
    if (activeTab != tab || force) {
        mealsList.classList.remove("active", "show");
        showAllMeals(getMealsOfCategory(tab.dataset.menuCat));
        mealsList.classList.add("active");
        setTimeout(function() {
            mealsList.classList.add("show");
        }, 1);
        emptyState.classList.add("d-none");
        searchInput.value = "";
        searchClearIcon.classList.add("d-none");
    }
}

function setMealsState(hasResults) {
    const mealsList = menuBody.querySelector(".meals-list");
    mealsList.classList.toggle("active", hasResults);
    mealsList.classList.toggle("show", hasResults);
    emptyState.classList.toggle("d-none", hasResults);
}

function searchMeal(text) {
    const activeTab = searchInput.closest(".section-content").querySelector(".menu-tabs .menu-tab.active");
    const query = text.trim().toLowerCase();
    const results = getMealsOfCategory(activeTab.dataset.menuCat).filter(meal => meal.name.toLowerCase().includes(query));
    results.length && showAllMeals(results);
    setMealsState(results.length > 0);
}

function goToMenuTab(category) {
    const tab = document.querySelector(`.menu-tabs .menu-tab[data-menu-cat="${category}"]`);
    const menuTop = document.querySelector("#food-menu").offsetTop;
    const onScroll = function() {
        if (window.scrollY >= menuTop - window.innerHeight) {
            setActiveTab(tab, true);
            window.removeEventListener("scroll", onScroll);
        }
    };
    window.addEventListener("scroll", onScroll);
    window.scrollTo(0, menuTop + navbar.offsetHeight * 1.5);
}


/* ---------- Meal modal ---------- */
function buildMealModalHtml(meal) {
    return `
        <div class="modal-close text-light fs-5" onclick="closeModal()">
            <i class="fa-regular fa-circle-xmark"></i>
        </div>

        <div class="section-heading mb-4 text-center">
            <h6 class="accent-color">SPECIAL SELECTION</h6>
            <img src="${imageUrl("separator.svg")}" class="img-fluid" alt="separator">
            <h2 class="display-6 text-light" id="meal-title">${meal.name}</h2>
        </div>

        <div class="section-content">
            <div class="meal-carousel" data-meal-id="${meal.id}">
                <div class="meal-image flex-center rounded-3">
                    <img src="${imageUrl(meal.images[0])}" class="img-fluid" alt="${meal.name}">
                </div>
                <div class="meal-price px-2 py-1 px-sm-3 py-sm-2 rounded-start">
                    <h5 class="mb-0 fw-bold">$${meal.price.toFixed(2)}</h5>
                </div>
                <button class="prev flex-center" onclick="switchMeal(this)"><i class="fa-solid fa-chevron-left"></i></button>
                <button class="next flex-center" onclick="switchMeal(this)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>

            <div class="meal-description muted-color mt-3">
                <p class="mb-0">${meal.description}</p>
            </div>
        </div>
    `;
}

function showMealModal(id) {
    const box = getMealBox();
    box.innerHTML = buildMealModalHtml(getMealById(id));
    mealPrevButton = box.querySelector(".prev");
    mealNextButton = box.querySelector(".next");
    openModal("meal");
}

function updateMealData(meal) {
    const box = getMealBox();
    const image = box.querySelector(".meal-image img");
    box.querySelector("#meal-title").textContent = meal.name;
    box.querySelector(".meal-price").firstElementChild.textContent = `$${meal.price.toFixed(2)}`;
    box.querySelector(".meal-description").firstElementChild.textContent = meal.description;
    image.setAttribute("src", imageUrl(meal.images[0]));
    image.setAttribute("alt", meal.name);
}

function switchMeal(button) {
    const carousel = button.closest(".meal-carousel");
    const currentMeal = getMealById(carousel.dataset.mealId);
    const categoryMeals = getMealsOfCategory(currentMeal.type);
    const step = button.classList.contains("next") ? 1 : -1;
    const nextIndex = (categoryMeals.indexOf(currentMeal) + step + categoryMeals.length) % categoryMeals.length;
    const nextMeal = categoryMeals[nextIndex];
    carousel.dataset.mealId = nextMeal.id;
    playSound(clickSound);
    updateMealData(nextMeal);
}


/* ---------- Forms ---------- */
const errorMessages = {
    name: "Enter letters only.",
    phone: "Enter a valid Egyptian phone number.",
    seats: "Available seats from 1 to 15",
    datetime: "Future time today (7 AM : 9 PM).",
    email: "Invalid email address.",
    message: "Message: 10-300 characters."
};

function isValidDate(value) {
    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(n => parseInt(n));
    const [hour, minute] = timePart.split(":").map(n => parseInt(n));
    const now = new Date();
    return year == now.getFullYear()
        && month == now.getMonth() + 1
        && day == now.getDate()
        && (hour > now.getHours() || hour == now.getHours() && minute >= now.getMinutes())
        && hour >= 7
        && (hour < 21 || hour == 21 && minute == 0);
}

function isValidMessage(value) {
    return value.length >= 10 && value.length <= 300;
}

function isFieldInvalid(name, value) {
    if (name == "datetime") return !isValidDate(value);
    if (name == "message") return !isValidMessage(value);
    return !validationRules[name]?.test(value);
}

function validateField(input) {
    const value = input.value.trim();
    const isEmpty = value == "";
    const hasError = isEmpty || isFieldInvalid(input.name, value);
    const errorBox = input.nextElementSibling;

    errorBox.classList.toggle("d-none", !hasError);
    input.classList.toggle("border-danger", hasError);
    if (hasError) {
        errorBox.textContent = isEmpty ? "This field is required." : errorMessages[input.name];
    }
    input.closest("form").querySelector(".form-reset").classList.remove("d-none");
}

function clearForm(icon) {
    const form = icon.closest("form");
    form.querySelectorAll(".form-control.border-danger").forEach(function(field) {
        field.classList.remove("border-danger");
        field.nextElementSibling.classList.add("d-none");
    });
    form.reset();
    icon.parentElement.classList.add("d-none");
}


/* ---------- Init ---------- */
checkNavOnScroll();
checkSliderInView();
showAllMeals(breakfastMeals);

/* ---------- Events ---------- */
btnNextSlide.addEventListener("click", () => changeSlide("next"));
btnPrevSlide.addEventListener("click", () => changeSlide("prev"));

if (heroSlider.classList.contains("autoplay")) {
    setTimeout(function() {
        intervalId = setInterval(updateDotProgress, intervalTime);
        heroSlider.addEventListener("mouseenter", function() {
            clearInterval(intervalId);
        });
        heroSlider.addEventListener("mouseleave", function() {
            intervalId = setInterval(updateDotProgress, intervalTime);
        });
    }, introDuration + 200);
}

modalBoxes.forEach(function(box) {
    box.addEventListener("click", function(event) {
        event.stopPropagation();
    });
});

document.addEventListener("scroll", function() {
    checkNavOnScroll();
    navbar.classList.toggle("toTop", window.scrollY > oldScrollY);
    oldScrollY = window.scrollY;
    sections.forEach(updateActiveLink);

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollFill.style.width = `${window.scrollY / maxScroll * 100}%`;

    checkSliderInView();
});

navLinks.forEach(function(link) {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        const go = () => scrollToSection(link);
        link.classList.contains("side-link") ? closeModal(go) : go();
    });
});

document.addEventListener("keyup", function(event) {
    if (event.key == "Escape") {
        closeModal();
    } else if (event.key == "ArrowRight" || event.key == "ArrowLeft") {
        const isNext = event.key == "ArrowRight";
        if (heroSlider.classList.contains("in-view")) {
            (isNext ? btnNextSlide : btnPrevSlide).click();
        } else if (document.querySelector('.modal-layer[data-modal="meal"].active')) {
            (isNext ? mealNextButton : mealPrevButton).click();
        }
    }
});

searchInput.addEventListener("keyup", function() {
    searchClearIcon.classList.toggle("d-none", !this.value);
    searchMeal(this.value);
});

searchClearIcon.addEventListener("click", function() {
    this.classList.add("d-none");
    searchInput.value = "";
    searchMeal("");
});

forms.forEach(function(form) {
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const fields = document.querySelector('.modal-layer[data-modal="booking"].active') ? bookingFields : contactFields;
        fields.forEach(validateField);
        if (!form.querySelector(".form-control.border-danger")) {
            form.reset();
            form.querySelector(".form-reset").classList.add("d-none");
        }
    });
});
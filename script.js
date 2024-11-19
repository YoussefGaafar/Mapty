'use strict';

// Refactoring the Code to an OOP Architecture
class Workout {
  dateWorkout = new Date();
  id = Date.now() + ''; // Date.now() --> Current TimeStamp in milliseconds
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // Array([lat, lng])
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  async init() {
    await this._setDescription(); // Call _setDescription asynchronously
    return this; // Return the object once initialization is complete
  }

  // I Added this part for displaying the street name and state as well in your workout (NEEDS Async Functions)
  async _fetchAddress() {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${this.coords[0]}&lon=${this.coords[1]}&format=json`
      );
      const data = await response.json();
      const { road: street, state } = data.address;
      return [street, state];
    } catch (err) {
      throw new Error(`${err.message}`);
    }
  }

  async _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const [street, state] = await this._fetchAddress();
    this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.dateWorkout.getMonth()]
    } ${this.dateWorkout.getDate()} at ${street ? street : 'Unknown'}, ${
      state ? state : ''
    }`;
  }

  incrementClick() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadance) {
    super(coords, distance, duration);
    this.cadance = cadance; // Steps per Minutes
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // Pace is defined in min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // Speed is defined in km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// Our Application Architecture
const form = document.querySelector('.form'); // This will be used whenever the user clicks on the Map which will open the Form
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const mapEl = document.querySelector('#map');

// Helper Function
const clearFormInputs = () => {
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
};

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = []; // Will hold all of the workouts of the user

  constructor() {
    this._getPosition(); // Calling the getPosition() method to Display the map right at instintiating the app object

    // Getting the data from local storage
    this._getLocalStorage();

    //NOTE!!: The 'this' keyword in addEventListener by default is pointing at the calling element(DOM Element), you will find an example at the end of the script
    form.addEventListener('submit', this._newWorkout.bind(this));

    // 6. Now checking if the user choosed running/cycling using the event 'change'
    inputType.addEventListener('change', this._toggleElevationField); // Here we don't need to bind the 'this' keyword, because we are not using it

    // 7. Adding the 'Move to Marker on Click' Event
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));

    mapEl.classList.add('map__loading'); // Applying the loading style
  }

  _getPosition() {
    // 1. (Displaying the Map) Using Geolocation API & Leaflet, which is similar to Internationalization (Intl) API.
    // This getCurrentPosition takes 2 callback Functions, the first one will be called on Success with a Position Parameter, and the second one will called on Errors.
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), // To avoid making the 'this' keyword in the loadMap to undefined
        function () {
          // Error Callback
          alert('You need to turn ON your location first!!');
        }
      );
  }

  _loadMap(position) {
    // Success Callback
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer(
      'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=4s47ql2svhzCGL8Of1vb', // Here I used map tiler api with an api key
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 20,
      }
    )
      .on('loading', () => {
        mapEl.classList.add('map__loading'); // Show loading state
      })
      .on('load', () => {
        mapEl.classList.remove('map__loading'); // Remove loading state
      })
      .addTo(this.#map);

    // 2. (Displaying the Markers on the map by click) using the map variable using the leaflet library
    this.#map.on('click', this._showForm.bind(this)); // Similar to addEventListener()

    // Rendering the Markers
    this.#workouts.forEach((work) => {
      this._renderWorkoutMarker(work); // We can now use it HERE !!
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;

    // 3. Rendering the Form HTML Element
    clearFormInputs();
    form.classList.remove('hidden');
    inputDistance.focus(); // Focuses on a specific input field in the Form
  }

  _hideForm() {
    // Emptying the inputs
    clearFormInputs();
    // Hiding the Form
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    clearFormInputs();
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputDistance.focus();
  }

  // This function will be called when ever the user clicks on the Map
  async _newWorkout(e) {
    // Helper Function for Validation
    const validInputs = (...inputs) => inputs.every((inp) => Number.isFinite(inp));
    const allPositives = (...inputs) => inputs.every((inp) => inp > 0);

    e.preventDefault();

    // Getting the data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng; // lat and lng are the latitude and longitude where we clicked
    let workout;

    // Setting the form loading spinner color
    const spinnerColor =
      type === 'running' ? 'var(--color-brand--2)' : 'var(--color-brand--1)';
    form.style.setProperty('--spinner-color', spinnerColor);

    // Show the loading spinner on the form
    form.classList.add('form__loading');

    // If Workout is running --> create a new Running()
    if (type === 'running') {
      const cadance = +inputCadence.value;
      // Checking if the data is valid (Data Validation) by a Guard Clause
      if (
        !validInputs(distance, duration, cadance) ||
        !allPositives(distance, duration, cadance)
      )
        return alert('Inputs have to be positive numbers!');
      //prettier-ignore
      workout = await new Running([lat, lng], distance, duration, cadance).init();
    }

    // If Workout is cycling --> create a new Cycling()
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // Checking if the data is valid (Data Validation) by a Guard Clause
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositives(distance, duration) // Because the elevation might be Negative
      )
        return alert('Inputs have to be positive numbers!');
      //prettier-ignore
      workout = await new Cycling([lat, lng], distance, duration, elevation).init();
    }

    // Add the new object to the workouts Array
    this.#workouts.push(workout);

    // Render the Workout on map as a marker
    this._renderWorkoutMarker(workout);

    // Render the workout on the list
    this._renderWorkout(workout);

    // Hide the Form and Clear the Input fields after each submit
    this._hideForm();

    // Setting the local storage to #workouts Array
    this._setLocalStorage();

    // Remove the loading spinner after processing is complete
    form.classList.remove('form__loading');
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`, // This is a CSS Class (.running-popup) OR (.cycling-popup)
        })
      )
      .setPopupContent(
        workout.type === 'running'
          ? `🏃 ${workout.description}`
          : `🚴‍♀️ ${workout.description}`
      ) // Can take a string or even an HTML Element
      .openPopup(); // Adding the Marker to the map
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
       <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workout.type === 'running')
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏻</span>
        <span class="workout__value">${workout.cadance}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;

    if (workout.type === 'cycling')
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
     <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;

    // Now we need to insert this html variable (Element) as a sibling to the form
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return; // Guard Clause

    const workout = this.#workouts.find((work) => work.id === workoutEl.dataset.id); // Finding the Workout with the specific ID

    this.#map.setView(workout.coords, this.#mapZoomLevel * 1.4, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  // localStorage Methods
  _setLocalStorage() {
    // localStorage.setItem('key', 'value'), JSON.stringify(object) --> Converts the Object into a string
    // localStorage uses Blocking so it's not adviced in Large amount of data, because it will slow down the application
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    // Now we need to convert back from JSON.stringfy to Object, we can do this by using JSON.parse()
    const data = JSON.parse(localStorage.getItem('workouts'));

    // Let's check if there is any data
    if (!data) return;
    this.#workouts = data;

    // Let's render those workouts
    this.#workouts.forEach((work) => {
      this._renderWorkout(work);
      //   this._renderWorkoutMarker(work); // We cannot use it here due to that the map is not yet rendered
    });
  }

  resetLocalStorage() {
    localStorage.removeItem('workouts'); // Removing an Item based on the key
    location.reload();
  }
}

// Rendering the App
const app = new App();

# 🗺️ Mapty: Map Your Workouts!

![Mapty Logo](./imgs/logo.png)

**Mapty** is your ultimate workout tracker! It combines geolocation, an interactive map, and smart workout logging to help you stay on top of your fitness goals. Designed with a focus on simplicity and functionality, Mapty is a perfect companion for runners 🏃‍♂️ and cyclists 🚴‍♀️.

---

## 📑 Table of Contents

1. [About The Project](#about-the-project)
2. [Features](#features)
3. [How It Works](#how-it-works)
4. [Project Architecture](#project-architecture)
5. [Technologies Used](#technologies-used)
6. [File Structure](#file-structure)
7. [Installation](#️installation)
8. [Learnings](#️learnings)
9. [Acknowledgments](#acknowledgments)

---

## 📖 About The Project

**Mapty** is built to help you:

- Log workouts (running or cycling) directly on an interactive map.
- Store and retrieve workouts via local storage.
- Visualize workout locations and stats dynamically.

### Why Mapty?

Tracking workouts shouldn't be tedious! Mapty automates workout logging and ensures you can always look back on your progress, all while keeping the interface simple yet powerful.

---

## 🌟 Features

- 🗺️ **Interactive Map Integration**: Powered by [Leaflet.js](https://leafletjs.com/), click anywhere on the map to log a workout.
- 📊 **Dynamic Calculations**: Automatically calculate stats like pace (running) and speed (cycling).
- 🖱️ **Click & Navigate**: Jump to a workout location on the map by clicking on the workout entry.
- 💾 **Persistent Storage**: Keep all your workouts even after refreshing the page.
- 🌐 **Address Integration**: Fetch street and state names for workouts dynamically via OpenStreetMap.

---

## 🚀 How It Works

1. **Load Map**

   - On page load, the app fetches your geolocation using the **Geolocation API** and displays the map.

2. **Add a Workout**

   - Click on the map to open a form.
   - Enter details (type, distance, duration, etc.) and submit the form.

3. **Workout Visualization**

   - Workouts are displayed as:
     - Markers on the map.
     - Entries in a sidebar list.

4. **Navigate**

   - Click on a workout in the list to pan the map to its location.

5. **Save & Persist**
   - Workouts are stored in local storage, ensuring they persist across sessions.

---

## 🏗️ Project Architecture

### Class Hierarchy

![Class Diagram](./imgs/Mapty-architecture.png)

### Workflow

![Workflow Diagram](./imgs/Mapty-flowchart.png)

This project is built using an Object-Oriented Programming (OOP) structure. The main components are:

1. **`Workout` Class**: A base class for common properties like distance, duration, and coordinates.
2. **`Running` & `Cycling` Classes**: Child classes extending `Workout` with specific methods (e.g., calculating pace or speed).
3. **`App` Class**: Manages the lifecycle, including map rendering, user interactions, and data persistence.

---

## ⚙️ Technologies Used

- **HTML5**: For structuring the app.
- **CSS3**: To style the interface beautifully.
- **JavaScript ES6**: Implements core logic using modern JavaScript concepts like classes and modules.
- **Leaflet.js**: Handles interactive mapping and geolocation.
- **OpenStreetMap API**: Dynamically fetches location details.
- **Local Storage API**: For storing workouts persistently.

---

## 📂 File Structure

```plaintext
📂 Project Directory
├── index.html       # HTML file
├── style.css        # CSS file
├── script.js        # JavaScript file
├── logo.png         # Project logo
├── Mapty-architecture-final.png # Class hierarchy diagram
├── Mapty-flowchart.png          # Workflow diagram
```

---

## ⚡ Installation

Follow these steps to set up and run the Mapty project on your local machine:

1. **Clone the Repository**:
   Open your terminal and run the following command to clone the repository:

   ```bash
   git clone https://github.com/YoussefGaafar/Mapty.git
   cd Mapty
   ```

2. **Open the Project**: Navigate to the project directory and open the index.html file in your browser
3. **Start Using the App**:
   - Allow location access when prompted by your browser.
   - Begin adding workouts directly on the interactive map.
   - All workouts are saved to your browser’s local storage automatically!

---

## 🧠 Learnings

From this project, I gained hands-on experience with:

- Designing **OOP-based architectures**.
- Leveraging the **Geolocation API** and mapping libraries like **Leaflet.js**.
- Using **local storage** for persistent data.
- Integrating **APIs** for dynamic data fetching.

---

## 🙌 Acknowledgments

- Inspired by [Jonas Schmedtmann's JavaScript Course](https://www.udemy.com/course/the-complete-javascript-course/).
- Map visuals are powered by [Leaflet.js](https://leafletjs.com/).
- Location data fetched using [OpenStreetMap](https://www.openstreetmap.org/).

---

🎉 **Thank you for checking out Mapty! Start mapping your workouts today!**

<div align="center">
  <img src="path/to/your/logo.png" alt="Logo" width="120" height="120">
  <h1 align="center">Project Trikal</h1>
  <p align="center">
    An Explainable Insight Engine for Geohazards, built for the NASA Space Apps Challenge 2025.
    <br />
    <a href="https://github.com/HetMistri/SpaceApps_Project"><strong>Explore the code »</strong></a>
    <br />
    <br />
    <a href="[Link to your Demo PPT/PDF]">View Demo</a>
    ·
    <a href="https://github.com/HetMistri/SpaceApps_Project/issues">Report Bug</a>
  </p>
</div>

## About The Project

![Project Trikal Screenshot](path/to/your/best_ui_screenshot.png)

Project Trikal addresses the critical issue of "alert fatigue" caused by vague, regional warnings for natural disasters. Current systems often issue broad alerts for entire districts, making it impossible for citizens and officials to assess their immediate, local risk. This leads to a dangerous desensitization where real threats are ignored.

Our solution is an interactive web platform that provides specific, targeted, and **explainable** insights for at-risk locations. By fusing multi-modal satellite data (SAR and DEM) and leveraging a custom machine learning pipeline, Project Trikal generates a clear, human-readable hypothesis that explains not only *what* the risk level is, but *why*. This transforms noisy, large-scale data into actionable intelligence, empowering local authorities to make proactive, life-saving decisions.

### Built With

This project was built with a modern, professional tech stack.

* [![Python][Python-badge]][Python-url]
* [![FastAPI][FastAPI-badge]][FastAPI-url]
* [![XGBoost][XGBoost-badge]][XGBoost-url]
* [![React][React.js-badge]][React.js-url]
* [![Mapbox][Mapbox-badge]][Mapbox-url]
* [![Docker][Docker-badge]][Docker-url]

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have **Docker** and **Docker Compose** installed on your system.
* [Docker Installation Guide](https://docs.docker.com/get-docker/)

### Installation

1.  Clone the repository:
    ```sh
    git clone [https://github.com/HetMistri/SpaceApps_Project.git](https://github.com/HetMistri/SpaceApps_Project.git)
    ```
2.  Navigate into the project directory:
    ```sh
    cd SpaceApps_Project
    ```
3.  Create the data directory structure and place your pre-processed GeoTIFF files within it:
    ```
    data/
    ├── SAR_DATA/
    │   ├── pre_event_vv.tif
    │   └── ...
    └── DEM_DATA/
        └── dem_slope.tif
    ```
4.  Build and run the entire application using Docker Compose:
    ```sh
    docker-compose up --build
    ```
5.  Access the web application in your browser at `http://localhost:3000`.

## Usage

Once the application is running, the web interface will display a map with several pre-defined case study locations. Clicking on one of these locations will trigger the backend to serve the pre-calculated analysis, which includes a risk score, an evidence-based hypothesis, and a visual heatmap of the high-risk zones.

## Project Structure

This project is a monorepo containing three primary services:

Project_Trikal/
├── backend/          # Django Backend API
├── frontend/         # React Frontend UI
└── ml_service/       # FastAPI ML Service & logic
├── data/             # For storing pre-processed data (ignored by Git)
└── docker-compose.yml  # Master orchestration file

## Roadmap / Future Work

- [ ] Expand the model to other geohazards like floods and wildfires.
- [ ] Integrate a wider range of data sources (e.g., real-time weather forecasts, soil moisture sensors).
- [ ] Implement a fully automated, on-demand data processing pipeline for live analysis.
- [ ] Deploy as a public, open-source tool for at-risk communities worldwide.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## The Team

* **Het Mistry** - Team Lead, DevOps & Full-Stack Dev
* **Om Patel** - AI/ML & Geospatial Data Science
* **Nakshi Shah** - Backend & Geospatial Backend
* **Takshil Patel** - SAR Image Processing & Data Collection
* **Yatrik Prajapati** - Cross Integration & 3D Models

Project Link: [https://github.com/HetMistri/SpaceApps_Project](https://github.com/HetMistri/SpaceApps_Project)

## Acknowledgments
* NASA Space Apps Challenge 2025
* NASA, ESA, and all open-data providers
* The Pydantic, FastAPI, and XGBoost communities

[Python-badge]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
[FastAPI-badge]: https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white
[FastAPI-url]: https://fastapi.tiangolo.com/
[XGBoost-badge]: https://img.shields.io/badge/XGBoost-006600?style=for-the-badge&logo=xgboost&logoColor=white
[XGBoost-url]: https://xgboost.ai/
[React.js-badge]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React.js-url]: https://reactjs.org/
[Mapbox-badge]: https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white
[Mapbox-url]: https://www.mapbox.com/
[Docker-badge]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/

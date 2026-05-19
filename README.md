# grundfos

A dashboard built for **Grundfos** to identify, analyze, and rank optimal building candidates for large-scale rainwater harvesting systems. 

By combining open map data, aerial computer vision, and solar geometric insights, this platform transforms raw geographic layers into high-yield water conservation opportunities.

## Overview

Finding optimal structures for rainwater harvesting requires understanding both macro logistics (location, building use) and micro geometry (roof surface area, pitch, obstructions). This repository hosts the pipeline and web interface that automates this analysis, enabling sustainability teams to identify high-potential structures at scale.

## Core Architecture & Stack

The platform is divided into a high-throughput geospatial ingestion pipeline and a responsive analytics web interface:

- **Frontend Dashboard:** Built with **Next.js** (App Router) and optimized for interactive spatial analysis using high-performance map rendering layers.
- **Geospatial Foundations:** Leverages **Overture Maps** open data schemas for reliable, global building footprint polygons and localized metadata attributes.
- **Micro-Geometry Engineering:** Integrates the **Google Solar API** to pull high-resolution flux, pitch, and detailed plane characteristics for target structures.
- **Computer Vision Pipeline:** A specialized CV workflow handles satellite/aerial image processing to segment catchment surfaces, filter out non-viable roof obstructions (HVAC, skylights), and calculate true unobstructed surface area coverage.

# AI Recipe Assistant

**Your smart kitchen companion powered by Google Gemini AI.**  
Get personalized recipes, cooking advice, and ingredient analysis through chat and image recognition.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Technical Stack](#technical-stack)
- [Image Processing](#image-processing)
- [Future Plans: IoT & Smart AI Stove](#future-plans-iot--smart-ai-stove)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AI Recipe Assistant is a web application that leverages Google Gemini AI to help users:
- Get cooking advice and recipe suggestions via chat.
- Upload images of ingredients for instant analysis and recipe generation.
- Plan for future integration with smart kitchen devices (Raspberry Pi, ESP32, AI-powered stove).

---

## Features

- **Chat with AI:** Ask for recipes, cooking tips, or ingredient advice.
- **Image Analysis:** Upload photos of your fridge or pantry to get ingredient lists and recipe ideas.
- **Recipe Generation:** Receive step-by-step recipes tailored to your available ingredients.
- **Mobile & Desktop Friendly:** Responsive design for all devices.
- **(Planned) IoT Integration:** Connect with Raspberry Pi or ESP32 for smart kitchen automation.

---

## How It Works

1. **Text Chat:**  
   Type your cooking-related question and get an AI-powered response.

2. **Image Upload:**  
   Upload a photo of your ingredients. The AI will:
   - Detect and list ingredients.
   - Suggest recipes you can make.

3. **Cooking-Only AI:**  
   The assistant is strictly limited to cooking, food, and kitchen topics. Off-topic questions are politely declined.

---

## Technical Stack

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui
- **AI Backend:** Google Gemini AI (Generative Model)
- **Image Processing:**  
  - Images are uploaded and converted to base64.
  - Sent to Gemini AI for ingredient detection and recipe suggestion.
- **State Management:** React hooks
- **Build Tool:** Vite

---

## Image Processing

- Uses the browser's camera or file upload to capture images.
- Images are processed client-side and sent to Gemini AI for analysis.
- The AI model identifies ingredients and generates recipes based on visual input.

---

## Future Plans: IoT & Smart AI Stove

**Raspberry Pi / ESP32 Integration (Planned):**
- Connect the app to a Raspberry Pi or ESP32 microcontroller in your kitchen.
- Enable real-time monitoring of kitchen devices (e.g., smart stove, temperature sensors).
- Control or receive feedback from smart appliances directly from the app.

**Smart AI Stove (Planned):**
- Integrate with a smart stove for:
  - Automated cooking instructions.
  - Safety monitoring (auto shut-off, temperature control).
  - Voice or app-based control.

*If you're interested in contributing to the IoT/AI stove integration, please open an issue or pull request!*

---

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nagnitin/ai-recipe-v1.git
   cd ai-recipe-v1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in your browser:**
   ```
   http://localhost:5173
   ```

---

## Contributing

Contributions are welcome!  
- Please open issues for bugs or feature requests.
- Pull requests for improvements, especially IoT/AI stove integration, are encouraged.

---

## License

This project is licensed under the MIT License.

---

**Made with ❤️ for foodies and makers.**

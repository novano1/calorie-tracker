# XCAL – AI-Powered Calorie Tracker ### Developed by Sachin Veldi  
This project is original work by Sachin Veldi. Please credit the author if you reference or adapt this code.

**XCAL** is a sleek, mobile-first calorie tracking app built with React Native. It combines barcode scanning, AI image recognition, and USDA nutrition data to help users monitor daily calorie intake and macronutrients in a fast, intuitive way.

---

## Features

- AI Food Scanner – Instantly identify food from photos using Hugging Face’s `efficientnet-food` model  
- Barcode Scanner – Quickly log items by scanning barcodes via Open Food Facts  
- USDA Integration – Fetch accurate nutritional info (calories, protein, carbs, fat) from the USDA FoodData Central API  
- Auto Daily Reset – Calories and macros reset every 24 hours  
- Group Tracking – Share food logs with friends using Life360-style group codes  
- Modern UI – Animated calorie/macro charts, dark theme with British Racing Green and Royal Blue palette  
- Firebase Auth – Secure email/password sign-in and user-specific food logs  
- Sleep Tracking (WIP) – Microphone-based sleep quality analysis and visualization  

---

![image](https://github.com/user-attachments/assets/30bd860b-da15-45da-8364-3b24591e6b6c)
![Screenshot 2025-06-26 163618](https://github.com/user-attachments/assets/a6273ca2-71c4-4487-b464-3a7dafc4db9a)



---

## Tech Stack

| Technology | Description |
|------------|-------------|
| React Native (Expo) | Mobile app framework |
| Firebase Auth + Firestore | Authentication & real-time data |
| USDA FoodData Central API | Nutritional info |
| Hugging Face AI | Image-based food detection |
| Open Food Facts API | Barcode-based logging |
| React Navigation | Multi-screen navigation |
| Framer Motion / Animated Charts | Smooth UI animations |

---

## Installation

```bash
git clone https://github.com/novano1/calorie-tracker.git
cd calorie-tracker
npm install
npx expo start

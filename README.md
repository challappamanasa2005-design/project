# LinkGuard AI - Phishing Detector

This is an AI-powered weblink detection tool built with React, Tailwind CSS, and Google Gemini. It identifies potential phishing attempts and explains security risks.

## 🚀 Local Setup (VS Code)

Follow these steps to run the project on your computer:

1. **Install Node.js**: Make sure you have [Node.js](https://nodejs.org/) installed.
2. **Open in VS Code**: Open this project folder in Visual Studio Code.
3. **Install Dependencies**:
   Open the terminal in VS Code (Ctrl+`) and run:
   ```bash
   npm install
   ```
4. **Set Up API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and get a free API Key.
   - Create a new file named `.env` in the root folder.
   - Add your API key to the `.env` file:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```
5. **Run the Project**:
   In the terminal, run:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 🌐 Deployment

You can deploy this app for free using platforms like **Vercel** or **Netlify**:

### Deploying to Vercel:
1. Push your code to a GitHub repository.
2. Connect your GitHub account to [Vercel](https://vercel.com/).
3. Import the repository.
4. **Important**: In the "Environment Variables" section during setup, add:
   - Key: `GEMINI_API_KEY`
   - Value: `your_api_key_here`
5. Click **Deploy**.

## 🛠️ Technologies Used
- **React**: For the user interface.
- **Tailwind CSS**: For modern, colorful styling.
- **Google Gemini API**: For intelligent link analysis.
- **Lucide React**: For beautiful icons.
- **Motion**: For smooth animations.

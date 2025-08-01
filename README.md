# My Next.js Recharts App

This is a simple Next.js application that demonstrates how to use Recharts to create charts in a React environment.

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd my-nextjs-recharts-app
   ```

2. **Install dependencies:**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Run the application:**
   Start the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` to see the application in action.

## Project Structure

- `pages/index.tsx`: The main entry point of the application where the `SimpleChart` component is rendered.
- `pages/_app.tsx`: Initializes pages and can be used for global styles or layout.
- `components/SimpleChart.tsx`: Contains the `SimpleChart` component that uses Recharts to render charts.
- `tsconfig.json`: TypeScript configuration file.
- `package.json`: Lists dependencies and scripts for the application.

## Usage

The `SimpleChart` component can be modified to display different types of charts by changing the data and chart types in `components/SimpleChart.tsx`. 

Feel free to explore and customize the charts as per your requirements!
# SmartcityProper

## Project Overview
SmartcityProper is a cutting-edge initiative designed to create smarter, more efficient, and sustainable urban environments. By leveraging modern technologies, the project aims to enhance the quality of life for citizens while optimizing city operations.

## Key Features
- **Smart Infrastructure**: Real-time monitoring and management through IoT integration.
- **Sustainability**: Advanced solutions for energy efficiency and waste management.
- **Enhanced Citizen Services**: Streamlined public services via digital platforms.
- **Data-Driven Insights**: Analytics to support informed decision-making.

## Installation Guide
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/SmartcityProper.git
   ```
2. **Navigate to the Project Directory**:
   ```bash
   cd SmartcityProper
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```

## Usage Instructions
1. **Start the Development Server**:
   ```bash
   npm start
   ```
2. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`.

## Front-end Interactions (JavaScript)

### “Why Invest Now” section enhancements
The homepage includes a small inline JavaScript block that enhances the **Why Invest Now** cards (`.why-now-card` with `data-why-card`):

- **Reveal on scroll:** uses `IntersectionObserver` to add the class `.is-visible` when each card enters the viewport (this triggers the fade/slide-in CSS).
- **Auto-highlight rotation:** every ~3.5 seconds it adds `.is-active` to the next card, giving a “featured” look (stronger shadow + slight lift).
- **Pause on interaction:** when a user hovers or focuses a card, rotation pauses and that card becomes active. Rotation resumes when the pointer leaves / focus leaves.

To disable this behavior, remove the inline script block labeled:
`<!-- Why Invest Now: reveal-on-scroll + auto-highlight rotation -->`

To tweak timing, adjust the `setInterval(..., 3500)` value in `index.html`.

## Contributing Guidelines
We welcome contributions to SmartcityProper! Follow these steps to contribute:
1. **Fork the Repository**.
2. **Create a New Branch**:
   ```bash
   git checkout -b feature-name
   ```
3. **Commit Your Changes**:
   ```bash
   git commit -m "Add feature-name"
   ```
4. **Push to Your Branch**:
   ```bash
   git push origin feature-name
   ```
5. **Submit a Pull Request**.

## License
This project is licensed under the [MIT License](LICENSE).

## Contact Information
For inquiries or feedback, please reach out to:
- **Name**: Niraj Ghorsaine
- **Email**: nirajghorsaine664@gmail.com
- **GitHub**: [Lunitic360](https://github.com/Lunitic360)

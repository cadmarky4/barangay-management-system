/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        smblue: {
          50: "#F3FFF0",
          100: "#8FDBC5",
          200: "#64ADC4",
          300: "#4887B7",
          400: "#367096",
        },
        darktext: "#1f2937",
        "stats-card": "#ffffff",
      },
    },
  },
};

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       colors: {
//         smblue: {
//           50: "#F3FFF0",
//           100: "#8FDBC5",
//           200: "#64ADC4",
//           300: "#4887B7",
//           400: "#367096",
//         },
//       },
//     },
//   },
// };

// const plugin = require('tailwindcss/plugin')

module.exports = {
    content:  [
        './*.{js,jsx}', 
        './**/*.{js,jsx}', 
        './index.html'
    ],
    theme: {
        screens: {
            'sm': '479px',
            'md': '767px',
            'lg': '991px',
            'xl': '1200px',
            '2xl': '1480px',
            '3xl': '1950px'
        },
        extend: {
            // typography: ({ theme }) => ({
            //     DEFAULT: {
            //         css: {
            //             '--tw-prose-headings': theme("colors.white"),
            //             '--tw-prose-body': theme("colors.white"),
            //             '--tw-prose-bold': theme("colors.white"),
            //             '--tw-prose-quotes': theme("colors.white"),
            //             a: {
            //                 color: theme("colors.yellow.200"),
            //                 textDecoration: "none",
            //                 '&:hover': {
            //                      textDecoration: "underline",
            //                 },
            //             },
            //             h1: {
            //                 fontSize: "2.25em",
            //                 fontWeight: "inherit",
            //                 lineHeight: "1.2em",
            //             },
            //         },
            //     },
            //     lg:{
            //         css: {
            //             h1: {
            //                 fontSize: "3em",
            //                 fontWeight: "inherit",
            //                 lineHeight: "1.5em",
            //             }
            //         }
            //     },                
            //     slate: {
            //         css: {
            //           a: {
            //             color: theme("colors.accent1"),
            //             textDecoration: "none",
            //             '&:hover': {
            //               textDecoration: "underline",
            //             },
            //           },
            //         },
            //     },                
            // }),
            colors: {
                'header': '#c9aa82',
                'accent1': '#1e559d',
                'accent2': '#cddbf3',
            },
            fontFamily: {
                'mono': ['"Courier New"', 'monospace'],
            },
        },
    },
  
    // plugins: [
        // require('@tailwindcss/typography'),
        // require('@tailwindcss/custom-forms'),
        // require('@tailwindcss/forms'),
        // ...
    // ]    
};


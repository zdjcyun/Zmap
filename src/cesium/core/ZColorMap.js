/*
 * @Author: gisboss
 * @Date: 2021-01-15 10:53:55
 * @LastEditors: gisboss
 * @LastEditTime: 2021-01-15 11:41:27
 * @Description: file content
 */

const colorMap = {
    DEFAULT: ["#006837", "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d73027", "#a50026"],
    /**
     * 降雨量颜色带
     */
    RAINFALL: {
        HOUR_1: [{
                min: 0,
                max: 1,
                color: 'rgba(0,0,0,0)'
            },
            {
                min: 1,
                max: 1.5,
                color: 'rgba(166,242,143,1)'
            },
            {
                min: 1.5,
                max: 7,
                color: 'rgba(61,186,61,1)'
            },
            {
                min: 7,
                max: 15,
                color: 'rgba(97,184,255,1)'
            },
            {
                min: 15,
                max: 40,
                color: 'rgba(0,0,225,1)'
            },
            {
                min: 40,
                max: 50,
                color: 'rgba(250,0,250,1)'
            },
            {
                min: 50,
                max: 100000,
                color: 'rgba(128,0,64,1)'
            }
        ],
        HOUR_3: [{
                min: 0,
                max: 1,
                color: 'rgba(0,0,0,0)'
            },
            {
                min: 1,
                max: 3,
                color: 'rgba(166,242,143,1)'
            },
            {
                min: 3,
                max: 10,
                color: 'rgba(61,186,61,1)'
            },
            {
                min: 10,
                max: 20,
                color: 'rgba(97,184,255,1)'
            },
            {
                min: 20,
                max: 50,
                color: 'rgba(0,0,225,1)'
            },
            {
                min: 50,
                max: 70,
                color: 'rgba(250,0,250,1)'
            },
            {
                min: 70,
                max: 100000,
                color: 'rgba(128,0,64,1)'
            }
        ],
        HOUR_6: [{
                min: 0,
                max: 1,
                color: 'rgba(0,0,0,0)'
            },
            {
                min: 1,
                max: 4,
                color: 'rgba(166,242,143,1)'
            },
            {
                min: 4,
                max: 13,
                color: 'rgba(61,186,61,1)'
            },
            {
                min: 13,
                max: 25,
                color: 'rgba(97,184,255,1)'
            },
            {
                min: 25,
                max: 60,
                color: 'rgba(0,0,225,1)'
            },
            {
                min: 60,
                max: 120,
                color: 'rgba(250,0,250,1)'
            },
            {
                min: 120,
                max: 100000,
                color: 'rgba(128,0,64,1)'
            }
        ],
        HOUR_12: [{
                min: 0,
                max: 1,
                color: 'rgba(0,0,0,0)'
            },
            {
                min: 1,
                max: 5,
                color: 'rgba(166,242,143,1)'
            },
            {
                min: 5,
                max: 15,
                color: 'rgba(61,186,61,1)'
            },
            {
                min: 15,
                max: 30,
                color: 'rgba(97,184,255,1)'
            },
            {
                min: 30,
                max: 70,
                color: 'rgba(0,0,225,1)'
            },
            {
                min: 70,
                max: 140,
                color: 'rgba(250,0,250,1)'
            },
            {
                min: 140,
                max: 100000,
                color: 'rgba(128,0,64,1)'
            }
        ],
        HOUR_24: [{
                min: 0,
                max: 1,
                color: 'rgba(0,0,0,0)'
            },
            {
                min: 1,
                max: 10,
                color: 'rgba(166,242,143,1)'
            },
            {
                min: 10,
                max: 25,
                color: 'rgba(61,186,61,1)'
            },
            {
                min: 25,
                max: 50,
                color: 'rgba(97,184,255,1)'
            },
            {
                min: 50,
                max: 100,
                color: 'rgba(0,0,225,1)'
            },
            {
                min: 100,
                max: 250,
                color: 'rgba(250,0,250,1)'
            },
            {
                min: 250,
                max: 100000,
                color: 'rgba(128,0,64,1)'
            }
        ],
    },

    /**
     * 温度颜色带
     */
    TEMPERATURE: [{
            min: -50,
            max: -45,
            color: "#2e0057"
        },
        {
            min: -45,
            max: -40,
            color: "#4a008b"
        },
        {
            min: -40,
            max: -35,
            color: "#0d0b66"
        },
        {
            min: -35,
            max: -30,
            color: "#0c2695"
        },
        {
            min: -30,
            max: -25,
            color: "#0c43c4"
        },
        {
            min: -25,
            max: -20,
            color: "#1a6bd7"
        },
        {
            min: -20,
            max: -15,
            color: "#3492f4"
        },
        {
            min: -15,
            max: -10,
            color: "#67b7f7"
        },
        {
            min: -10,
            max: -5,
            color: "#96cef4"
        },
        {
            min: -5,
            max: -0,
            color: "#c1e6f9"
        },
        {
            min: 0,
            max: 5,
            color: "#fefec6"
        },
        {
            min: 5,
            max: 10,
            color: "#f8f1a1"
        },
        {
            min: 10,
            max: 15,
            color: "#ffe479"
        },
        {
            min: 15,
            max: 20,
            color: "#ffcc4f"
        },
        {
            min: 20,
            max: 25,
            color: "#f19906"
        },
        {
            min: 25,
            max: 30,
            color: "#f07609"
        },
        {
            min: 30,
            max: 35,
            color: "#eb481f"
        },
        {
            min: 35,
            max: 40,
            color: "#ab0110"
        },
        {
            min: 40,
            max: 45,
            color: "#650015"
        },
        {
            min: 45,
            max: 50,
            color: "#44000b"
        }
    ],
}




export default colorMap;
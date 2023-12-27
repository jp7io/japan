// @ts-check

/**
 * @typedef {import('../data/regions.js').Region} Region
 */

/**
 * @param {string} str
 * @returns {string}
 */
export function replaceSpecialCharactersWithAscii(str) {
  return str.replace(/[ÀÁÂÃÄÅ]/g, 'A')
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[ÈÉÊË]/g, 'E')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ÌÍÎÏ]/g, 'I')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[ÒÓÔÕÖŌ]/g, 'O')
    .replace(/[òóôõöō]/g, 'o')
    .replace(/[ÙÚÛÜŪ]/g, 'U')
    .replace(/[ùúûüū]/g, 'u')
    .replace(/[Ç]/g, 'C')
    .replace(/[ç]/g, 'c')
    .replace(/[Ñ]/g, 'N')
    .replace(/[ñ]/g, 'n');
}

/**
 * @param {string} id
 * @param {string} filename
 * @param {() => void=} callback
 */
export async function loadHTML(id, filename, callback) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  const response = await fetch(filename);
  const responseText = await response.text();

  element.innerHTML = responseText || `<h1>"${filename}" not found.</h1>`;

  callback && callback();
}

/**
 * @param {import('../data/regions').Region[]} data
 * @param {string | null} filter
 */
const filteredData = (data, filter) => data.filter(region => !filter || region.name.en === filter);

/**
 * @param {import('../data/regions').Region[]} data
 * @param {string | null} filter
 */
export function parseData(data, filter = null) {
  /** @type {(string|number)[][]} */
  const dataArray = [['Prefecture', 'Index']];

  filteredData(data, filter).forEach((region, index) => {
    region.prefectures.forEach(({ name }) => {
      dataArray.push([
        replaceSpecialCharactersWithAscii(name.en),
        index,
      ]);
    });
  });

  return dataArray;
}

/**
 * @param {import('../data/regions').Region[]} data
 * @param {string | null} filter
 */
export function parseDataForPrefectures(data, filter = null) {
  /** @type {(string|number)[][]} */
  const dataArray = [['Lat', 'Lng', 'Prefecture', 'Index']];

  filteredData(data, filter).forEach((region) => {
    region.prefectures.forEach(({ name, location }, index) => {
      dataArray.push([
        location.lat,
        location.lng,
        name.ja.join(''),
        index
      ]);
    })
  });

  return dataArray;
}

/**
 * @param {import('../data/regions').Region[]} data
 * @param {string | null} filter
 */
export function parseDataForCities(data, filter = null) {
  /** @type {(string|number)[][]} */
  const dataArray = [['Lat', 'Lng', 'City', 'isFavorite']];

  filteredData(data, filter).forEach((region) => {
    region.prefectures.forEach(prefecture => {
      prefecture.cities?.forEach(({ name, location }) => {
        dataArray.push([
          location.lat,
          location.lng,
          name.ja.join(''),
          1
        ]);
      })
    });
  });

  return dataArray;
}

/**
 * @param {Object[]} data
 * @param {string | null} filter
 */
export function extractCities(data, filter = null) {
  const dataArray = [];

  filteredData(data, filter).forEach((region) => {
    region.prefectures.forEach(prefecture => {
      prefecture.cities?.forEach(city => {
        dataArray.push({ ...city, prefecture: { ...prefecture, region } });
      })
    });
  });

  return dataArray;
}

/**
 * @param {Object[]} data
 * @param {string | null} filter
 */
export function extractPrefectures(data, filter = null) {
  const dataArray = [];

  filteredData(data, filter).forEach((region) => {
    region.prefectures.forEach(prefecture => {
      dataArray.push({ ...prefecture, region });
    });
  });

  return dataArray;
}

/**
 * @param {SVGTextElement} elm
 * @param {boolean=} cityBottom
 */
export function addStroke(elm, cityBottom = false) {
  const strokePos = [
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
  ];

  const x = Number(elm.getAttribute('x'));
  const y = Number(elm.getAttribute('y'));

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

  setElmAttributes(circle, {
    cx: x - 1,
    cy: cityBottom ? y - 14 : y + 9,
    r: '30',
    fill: 'none',
    stroke: 'black',
    class: 'circle',
  });
  elm.parentElement?.appendChild(circle);

  strokePos.forEach(pos => {
    const stroke = elm.cloneNode(true);
    setElmAttributes(stroke, {
      fill: 'white',
      x: x + pos.x,
      y: y + pos.y,
    });
    elm.parentElement?.appendChild(stroke);
  })

  const clonedElm = elm.cloneNode(true);
  setElmAttributes(clonedElm, {
    x,
    y,
  });
  elm.parentElement?.appendChild(clonedElm);
  elm.remove();
}

/**
 * @param {any} elm
 * @param {Object} attributes
 */
export function setElmAttributes(elm, attributes) {
  Object.entries(attributes).forEach(([key, value]) => elm.setAttribute(key, String(value)));
}

export function parseHash() {
  const hash = document.location.hash.replace('#', '');
  const filters = decodeURI(hash).split('/');

  if (filters[0] === 'Tokyo') {
    return {
      region: 'Tokyo',
      municipality: filters[1],
    };
  }

  const [region, prefecture, city] = filters;

  return { region, prefecture, city };
}

export function debounce(func, delay) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export function isMobile() {
  return window.innerWidth <= 768;
}


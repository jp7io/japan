// @ts-check

import { state } from "./state.js";
import { setActiveRegion, setActivePrefecture, setActiveCity, centerPosition } from './map/index.js';
import { debounce, parseHash } from './utils.js';
import { setLayer } from './layers.js';
import { createInlineSVG } from './svg.js';
import { centerTokyo, findMunicipality } from './tokyo.js';
import { Root } from '../components/index.js';
import { layers } from '../data/dict.js';
import van from '../lib/van.js';
import { findRegion, findPrefecture, findCity } from './regions.js';

google.charts.load('current', { 'packages': ['geochart'], 'mapsApiKey': 'AIzaSyDWQEGh9S63LVWJOVzUX9lZqlTDWMe1nvk' });
google.charts.setOnLoadCallback(async () => {
  van.add(document.body, Root);
  createInlineSVG();
  setActiveData();
  initPosition();
});

function setActiveData() {
  const { region, prefecture, city, municipality } = parseHash();

  if (region === 'Tokyo') {
    setLayer('tokyo');
    state.layer.val = layers.tokyo;
    if (municipality) {
      const municipalityData = findMunicipality(municipality);
      if (municipalityData) {
        state.municipalityType.val = municipalityData.type;
        state.municipality.val = municipalityData;
      }
    }
    return;
  }

  const regionData = findRegion(region);
  const prefectureData = prefecture && findPrefecture(prefecture);
  const cityData = city && findCity(city);

  setActiveRegion(regionData, () => {
    setTimeout(() => {
      if (cityData) {
        setLayer('capitals');
        setActiveCity(cityData);
      } else if (prefectureData) {
        setLayer('prefectures');
        setActivePrefecture(prefectureData);
      }
    }, 1);
  });
}

function initPosition() {
  window.addEventListener('resize', debounce(() => {
    const { layer, municipalityType } = state;
    if (layer.val?.en === 'Tokyo' && municipalityType.val) {
      centerTokyo(municipalityType.val);
      return;
    }
    /** @type {NodeListOf<SVGTextElement>} */
    const cities = document.querySelectorAll('svg g[data-city=true] text:last-of-type');
    centerPosition(cities);
  }, 100));
}

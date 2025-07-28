const cores = {
  CPC: "#FF5151",
  CPM: "#FFEA00",
  "CPI-1": "#1391D2",
  "CPI-2": "#9C27B0",
  "CPI-3": "#F9A825",
  "CPI-4": "#d62728",
  "CPI-5": "#880E4F",
  "CPI-6": "#1A237E",
  "CPI-7": "#673AB7",
  "CPI-8": "#7f7f7f",
  "CPI-9": "#0097A7",
  "CPI-10": "#E65100",
};

let regioes = {};

fetch('/efetivo/api/batalhao_municipio')
  .then(res => res.json())
  .then(data => {
    regioes = data;
  })
  .catch(error => {
    console.error('Erro ao carregar regiões:', error);
    regioes = {};
  });

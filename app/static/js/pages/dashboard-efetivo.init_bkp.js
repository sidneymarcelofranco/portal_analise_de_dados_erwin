// Ativa tooltips Bootstrap
document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Inicialização dos gráficos e eventos
    if (document.querySelector("#evolucao_anual_chart")) {
        document.querySelectorAll('.kpi-card').forEach(card => {
            card.addEventListener('click', function () {
                const chartType = this.getAttribute('data-chart-type');
                if (chartType) {
                    updateChart(chartType, currentPeriod);
                    updateKPIStates(chartType);
                }
            });
            card.addEventListener('mouseenter', function () {
                if (this.getAttribute('data-chart-type') !== currentType) {
                    this.style.transform = 'scale(1.01)';
                    this.style.transition = 'all 0.2s ease';
                }
            });
            card.addEventListener('mouseleave', function () {
                if (this.getAttribute('data-chart-type') !== currentType) {
                    this.style.transform = 'scale(1)';
                }
            });
        });

        updateKPIStates('ativos');
        createMiniChart();

        const periodSelect = document.getElementById('chart-period-select');
        if (periodSelect) {
            periodSelect.addEventListener('change', function () {
                currentPeriod = this.value;
                updateChart(currentType, currentPeriod);

                const title = document.querySelector('#evolucao_anual_chart')
                    ?.closest('.card')
                    ?.querySelector('.card-title.mb-0');
                if (title) {
                    title.textContent = currentPeriod === 'mensal' ? 'Evolução Mensal' : 'Evolução Diária';
                }
            });
        }
    }

    renderPostoChart();
    renderDonutChart();
    renderPolarAreaCirculo();

    const observer = new MutationObserver(function () {
        renderPostoChart();
        renderDonutChart();
        renderPolarAreaCirculo();
        updateChart(currentType, currentPeriod);
    });
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-bs-theme']
    });

    // ⚠️ Inicialização dos dados
    carregarEfetivoMensal();
    carregarEfetivoDiario();
    carregarEfetivoKPI();
});

const themeChartColors = ['#1e40af', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#3b82f6', '#6366f1', '#f472b6', '#64748b'];
const PostoColumnColors = ['#007BFF', '#FFA500', '#FF0000', '#000000'];

const chartData = {
    ativos:   { name: 'Ativos',   mensal: [], diario: [], color: '#3b82f6', icon: 'ph ph-users', bgClass: 'bg-primary-subtle text-primary' },
    agregados:{ name: 'Agregados',mensal: [], diario: [], color: '#6b7280', icon: 'bi bi-hospital', bgClass: 'bg-secondary-subtle text-secondary' },
    inativos: { name: 'Inativos', mensal: [], diario: [], color: '#10b981', icon: 'ph ph-mask-happy-thin', bgClass: 'bg-success-subtle text-success' },
    desligados:{ name: 'Desligados',mensal: [], diario: [], color: '#ef4444', icon: 'ph ph-mask-sad-light', bgClass: 'bg-danger-subtle text-danger' },
    mortos:   { name: 'Mortos',   mensal: [], diario: [], color: '#f59e0b', icon: 'ph ph-skull-light', bgClass: 'bg-warning-subtle text-warning' }
};

let currentChart = null;
let currentType = 'ativos';
let currentPeriod = 'mensal';

function getThemeColors() {
    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    return {
        textColor: isDarkTheme ? '#ffffff' : '#304758',
        labelColor: isDarkTheme ? '#e5e7eb' : '#6b7280',
        gridColor: isDarkTheme ? '#374151' : '#f1f5f9'
    };
}

function updateChart(type, period = 'mensal') {
    const data = chartData[type];
    const themeColors = getThemeColors();

    const categories = period === 'mensal'
        ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        : chartData.datasDiario || [];

    const seriesData = period === 'mensal' ? data.mensal : data.diario;

    const options = {
        series: [{ name: data.name, data: seriesData }],
        chart: {
            type: 'area',
            height: 350,
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        colors: [data.color],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            categories: categories,
            labels: { style: { colors: themeColors.labelColor } }
        },
        yaxis: {
            labels: {
                formatter: value => value.toLocaleString(),
                style: { colors: themeColors.labelColor }
            }
        },
        grid: { borderColor: themeColors.gridColor, strokeDashArray: 3 },
        tooltip: {
            theme: 'dark',
            y: { formatter: value => value.toLocaleString() }
        }
    };

    if (currentChart) currentChart.destroy();

    const chartElement = document.querySelector("#evolucao_anual_chart");
    if (chartElement) {
        currentChart = new ApexCharts(chartElement, options);
        currentChart.render();

        const indicator = document.getElementById('chart-indicator');
        if (indicator) {
            indicator.innerHTML = `<i class="${data.icon} me-1"></i>${data.name} (${period === 'mensal' ? 'Mensal' : 'Diário'})`;
            indicator.className = `badge ${data.bgClass}`;
        }

        currentType = type;
    }
}

function updateKPIStates(activeType) {
    document.querySelectorAll('.kpi-card').forEach(card => {
        const cardType = card.getAttribute('data-chart-type');
        card.style.transform = cardType === activeType ? 'scale(1.02)' : 'scale(1)';
        card.style.boxShadow = cardType === activeType ? '0 8px 25px rgba(0,0,0,0.15)' : '';
        card.style.transition = 'all 0.3s ease';
    });
}

function createMiniChart() {
    const el = document.querySelector("#mini-chart-ativos");
    if (!el) return;
    el.innerHTML = "";

    const series = [{
        name: "Efetivo",
        data: municipios.map(m => ({
            x: m.nome,
            y: m.valor
        }))
    }];

    const options = {
        chart: { type: 'bar', height: 200, toolbar: { show: false } },
        series: series,
        xaxis: { categories: municipios.map(m => m.nome) },
        colors: ['#3b82f6'],
        dataLabels: { enabled: true }
    };

    const chart = new ApexCharts(el, options);
    chart.render();
}

async function carregarFaixaEtariaChart() {
    const res = await fetch('/efetivo/faixa-etaria-filtrada');
    const data = await res.json();
    if (window.ApexCharts && document.querySelector("#faixa_etaria_chart")) {
        const options = {
            chart: { type: 'bar', height: 200, toolbar: { show: false } },
            series: [{ name: "Efetivo", data: data.series }],
            xaxis: { categories: data.labels },
            colors: ['#3b82f6'],
            dataLabels: { enabled: true }
        };
        new ApexCharts(document.querySelector("#faixa_etaria_chart"), options).render();
    }
}
document.addEventListener('DOMContentLoaded', carregarFaixaEtariaChart);

async function carregarEfetivoMensal() {
    const res = await fetch('/efetivo/mensal');
    const data = await res.json();
    if (!data) return;
    // Supondo que data seja um objeto com as chaves: ativos, agregados, inativos, desligados, mortos
    Object.keys(chartData).forEach(tipo => {
        chartData[tipo].mensal = Object.values(data[tipo]);
    });
    updateChart(currentType, 'mensal');
}

async function carregarEfetivoDiario() {
    const res = await fetch('/efetivo/diario');
    const data = await res.json();
    if (!data) return;
    // Supondo que data seja um objeto com as chaves: ativos, agregados, inativos, desligados, mortos
    Object.keys(chartData).forEach(tipo => {
        chartData[tipo].diario = Object.values(data[tipo]);
    });
    // Se precisar de datas para o eixo X diário:
    chartData.datasDiario = Object.keys(data.ativos);
}

async function carregarEfetivoKPI() {
    const res = await fetch('/efetivo/kpi');
    const data = await res.json();
    if (!data) return;
    // Atualize os valores dos KPIs no DOM
    document.getElementById('kpi-ativos-valor').querySelector('.counter-value').textContent = data.ativos;
    document.getElementById('kpi-agregados-valor').querySelector('.counter-value').textContent = data.agregados;
    document.getElementById('kpi-inativos-valor').querySelector('.counter-value').textContent = data.inativos;
    document.getElementById('kpi-desligados-valor').querySelector('.counter-value').textContent = data.desligados;
    document.getElementById('kpi-mortos-valor').querySelector('.counter-value').textContent = data.mortos;
}
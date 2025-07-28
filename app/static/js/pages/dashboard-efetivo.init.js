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

    const options = {
        series: [{ name: 'Ativos', data: [78000, 79500, 80200, 80720] }],
        chart: { type: 'line', height: 80, toolbar: { show: false }, sparkline: { enabled: true } },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#3b82f6'],
        tooltip: { enabled: false },
        grid: { show: false },
        xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { show: false } }
    };

    new ApexCharts(el, options).render();
}

function renderPostoChart() {
    const themeColors = getThemeColors();
    const options = {
        chart: { type: 'bar', height: 400, toolbar: { show: false } },
        plotOptions: {
            bar: { horizontal: true, borderRadius: 4, distributed: true }
        },
        colors: themeChartColors,
        dataLabels: {
            enabled: true,
            offsetX: 30,
            style: { fontSize: '12px', colors: [themeColors.textColor] }
        },
        series: [{ name: 'Efetivo', data: [64, 228, 518, 1674, 2246, 193, 650, 11618, 61133, 3823] }],
        xaxis: {
            categories: [
                "Coronel",
                "Tenente Coronel",
                "Major",
                "Capitão",
                "1º Tenente",
                "Aspirante a Oficial",
                "Aluno-oficial",
                "Subtenente",
                "Cabo E Soldado",
                "Aluno Soldado"
            ],
            labels: { style: { fontSize: '12px', colors: themeColors.labelColor } }
        },
        yaxis: { labels: { style: { fontSize: '11px' } } },
        grid: { borderColor: themeColors.gridColor, strokeDashArray: 3 },
        tooltip: { y: { formatter: val => val.toLocaleString() + " militares" } },
        legend: { show: false }
    };

    const el = document.querySelector("#postos_chart");
    if (el) {
        el.innerHTML = '';
        new ApexCharts(el, options).render();
    }
}


function renderDonutChart() {
    const themeColors = getThemeColors();
    const options = {
        series: [42580, 21890],
        chart: { height: 400, type: "donut" },
        labels: ["Masculino", "Feminino"],
        legend: {
            position: "bottom",
            labels: { colors: "#6b7280" },
            formatter: (label, opts) => `${label} (${options.series[opts.seriesIndex]})`
        },
        dataLabels: { dropShadow: { enabled: false }, style: { colors: [themeColors.textColor] } },
        colors: ["#007BFF","#FF0000"]
    };

    const el = document.querySelector("#sexo_chart");
    if (el) {
        el.innerHTML = '';
        new ApexCharts(el, options).render();
    }
}

async function renderPolarAreaCirculo() {
    try {
        const res = await fetch('/efetivo/mock-cor-cutis');
        const data = await res.json();

        const options = {
            series: data.series,
            chart: { type: 'polarArea', height: 400 },
            labels: data.labels,
            stroke: { colors: ['#fff'] },
            fill: { opacity: 0.9 },
            colors: themeChartColors,
            dataLabels: { enabled: false },
            legend: {
                position: "bottom",
                labels: { colors: "#6b7280" },
                formatter: (label, opts) => `${label} (${options.series[opts.seriesIndex]})`
            },
            plotOptions: {
                polarArea: {
                    rings: { strokeColor: '#e5e7eb' },
                    spokes: { strokeColor: '#e5e7eb' }
                }
            }
        };

        const el = document.querySelector("#circulo_polar_area");
        if (el) {
            el.innerHTML = '';
            new ApexCharts(el, options).render();
        }
    } catch (error) {
        console.error('Erro ao carregar cor ou raça:', error);
    }
}

// API Data
async function carregarEfetivoMensal() {
    try {
        const res = await fetch('/efetivo/mensal');
        const data = await res.json();

        const ativos = Array(12).fill(null);
        const agregados = Array(12).fill(null);
        const inativos = Array(12).fill(null);
        const desligados = Array(12).fill(null);
        const mortos = Array(12).fill(null);

        data.forEach(item => {
            const idx = item.mes - 1;
            ativos[idx] = item.Ativos;
            agregados[idx] = item.Agregados;
            inativos[idx] = item.Inativos;
            desligados[idx] = item.Demitidos;
            mortos[idx] = item.Mortos;
        });

        chartData.ativos.mensal = ativos;
        chartData.agregados.mensal = agregados;
        chartData.inativos.mensal = inativos;
        chartData.desligados.mensal = desligados;
        chartData.mortos.mensal = mortos;

        updateChart(currentType, currentPeriod);
    } catch (error) {
        console.error('Erro ao carregar efetivo mensal:', error);
    }
}

async function carregarEfetivoDiario() {
    try {
        const hoje = new Date();
        const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
        const url = `/efetivo/diario?mes=${mesAtual}`;
        const res = await fetch(url);
        const data = await res.json();

        data.sort((a, b) => a.data.localeCompare(b.data));

        chartData.datasDiario = data.map(item => {
            const [ano, mes, dia] = item.data.split('-');
            return `${dia}/${mes}`;
        });

        chartData.ativos.diario = data.map(item => item.Ativos);
        chartData.agregados.diario = data.map(item => item.Agregados);
        chartData.inativos.diario = data.map(item => item.Inativos);
        chartData.desligados.diario = data.map(item => item.Demitidos);
        chartData.mortos.diario = data.map(item => item.Mortos);

        if (currentPeriod === 'diario') updateChart(currentType, 'diario');
    } catch (error) {
        console.error('Erro ao carregar efetivo diário:', error);
    }
}

async function carregarEfetivoKPI() {
    try {
        const res = await fetch('/efetivo/kpi');
        const kpi = await res.json();
        // console.log('KPI da API:', kpi); // <-- Adicione este log

        setKPIValue('kpi-ativos-valor', kpi.ativos.valor);
        setKPIValue('kpi-agregados-valor', kpi.agregados.valor);
        setKPIValue('kpi-inativos-valor', kpi.inativos.valor);
        setKPIValue('kpi-desligados-valor', kpi.desligados.valor);
        setKPIValue('kpi-mortos-valor', kpi.mortos.valor);

        setKPIPct('kpi-ativos-pct', kpi.ativos.percentual);
        setKPIPct('kpi-agregados-pct', kpi.agregados.percentual);
        setKPIPct('kpi-inativos-pct', kpi.inativos.percentual);
        setKPIPct('kpi-desligados-pct', kpi.desligados.percentual);
        setKPIPct('kpi-mortos-pct', kpi.mortos.percentual);

        // Atualize a data de coleta
        const dataColetaEl = document.getElementById('kpi-data-coleta');
        if (dataColetaEl && kpi.data_coleta) {
            dataColetaEl.textContent = kpi.data_coleta;
        }

        const mesEl = document.getElementById('kpi-mes');
        if (kpi.mes && mesEl) mesEl.textContent = 'Mês: ' + kpi.mes;
    } catch (error) {
        console.error('Erro ao carregar KPIs:', error);
    }
}

function setKPIValue(id, value) {
    const el = document.getElementById(id);
    // console.log('setKPIValue', id, el); // Adicione este log
    const formatted = value !== undefined && value !== null ? value.toLocaleString() : '-';
    if (el) {
        const span = el.querySelector('.counter-value');
        if (span) {
            span.textContent = formatted;
        } else {
            el.innerHTML = `<span class="counter-value">${formatted}</span>`;
        }
    }
}

function setKPIPct(id, pct) {
    const el = document.getElementById(id);
    if (el) el.textContent = pct + '%';
}

// Faixa Etária
async function carregarFaixaEtaria() {
    try {
        const posto = document.getElementById('faixa_posto_select')?.value || '';
        const sexo = document.getElementById('faixa_sexo_select')?.value || '';
        const url = `/efetivo/faixa-etaria-filtrada?posto=${encodeURIComponent(posto)}&sexo=${encodeURIComponent(sexo)}`;
        const res = await fetch(url);
        const data = await res.json();

        const options = {
            chart: { type: 'bar', height: 200, toolbar: { show: false } },
            series: [{ name: 'Efetivo', data: data.series }],
            xaxis: { categories: data.labels },
            colors: ['#3b82f6'],
            dataLabels: { enabled: true },
            grid: { borderColor: '#f1f5f9', strokeDashArray: 3 }
        };

        const el = document.getElementById('faixa_etaria_chart');
        if (el) {
            el.innerHTML = '';
            new ApexCharts(el, options).render();
        }
    } catch (error) {
        console.error('Erro ao carregar faixa etária:', error);
    }
}

// Tempo de Serviço
async function carregarTempoServico() {
    try {
        const posto = document.getElementById('tempo_posto_select')?.value || '';
        const sexo = document.getElementById('tempo_sexo_select')?.value || '';
        const url = `/efetivo/tempo-servico-filtrado?posto=${encodeURIComponent(posto)}&sexo=${encodeURIComponent(sexo)}`;
        const res = await fetch(url);
        const data = await res.json();

        const options = {
            chart: { type: 'bar', height: 200, toolbar: { show: false } },
            series: [{ name: 'Efetivo', data: data.series }],
            xaxis: { categories: data.labels },
            colors: ['#10b981'],
            dataLabels: { enabled: true },
            grid: { borderColor: '#f1f5f9', strokeDashArray: 3 }
        };

        const el = document.getElementById('tempo_servico_chart');
        if (el) {
            el.innerHTML = '';
            new ApexCharts(el, options).render();
        }
    } catch (error) {
        console.error('Erro ao carregar tempo de serviço:', error);
    }
}

// Residência Município
async function carregarResidenciaMunicipio() {
    try {
        const posto = document.getElementById('residencia_posto_select')?.value || '';
        const sexo = document.getElementById('residencia_sexo_select')?.value || '';
        const url = `/efetivo/municipio-mora-filtrado?posto=${encodeURIComponent(posto)}&sexo=${encodeURIComponent(sexo)}`;
        const res = await fetch(url);
        const data = await res.json();

        // Exemplo: gráfico de barras simples
        const labels = data.municipios.map(m => m.nome);
        const series = data.municipios.map(m => m.valor);

        const options = {
            chart: { type: 'bar', height: 200, toolbar: { show: false } },
            series: [{ name: 'Efetivo', data: series }],
            xaxis: { categories: labels },
            colors: ['#6366f1'],
            dataLabels: { enabled: true },
            grid: { borderColor: '#f1f5f9', strokeDashArray: 3 }
        };

        const el = document.getElementById('municipio_mora_map');
        if (el) {
            el.innerHTML = '';
            new ApexCharts(el, options).render();
        }
    } catch (error) {
        console.error('Erro ao carregar residência município:', error);
    }
}

// Estado Civil
async function carregarEstadoCivil() {
    try {
        const res = await fetch('/efetivo/mock-estado-civil');
        const data = await res.json();

        const options = {
            chart: { type: 'bar', height: 200, toolbar: { show: false } },
            series: [{ name: 'Efetivo', data: data.series }],
            xaxis: { categories: data.labels },
            colors: ['#f59e0b'],
            dataLabels: { enabled: true },
            grid: { borderColor: '#f1f5f9', strokeDashArray: 3 }
        };

        const el = document.getElementById('estado_civil_chart');
        if (el) {
            el.innerHTML = '';
            new ApexCharts(el, options).render();
        }
    } catch (error) {
        console.error('Erro ao carregar estado civil:', error);
    }
}

// Orientação Sexual
async function carregarOrientacaoSexual() {
    try {
        const res = await fetch('/efetivo/mock-orientacao-sexual');
        const data = await res.json();

        const options = {
            chart: { type: 'bar', height: 200, toolbar: { show: false } },
            series: [{ name: 'Efetivo', data: data.series }],
            xaxis: { categories: data.labels },
            colors: ['#f472b6'],
            dataLabels: { enabled: true },
            grid: { borderColor: '#f1f5f9', strokeDashArray: 3 }
        };

        const el = document.getElementById('orientacao_sexual_chart');
        if (el) {
            el.innerHTML = '';
            new ApexCharts(el, options).render();
        }
    } catch (error) {
        console.error('Erro ao carregar orientação sexual:', error);
    }
}

// Religião
async function carregarReligiao() {
    try {
        const res = await fetch('/efetivo/mock-religiao');
        const data = await res.json();

        const options = {
            chart: { type: 'bar', height: 200, toolbar: { show: false } },
            series: [{ name: 'Efetivo', data: data.series }],
            xaxis: { categories: data.labels },
            colors: ['#06b6d4'],
            dataLabels: { enabled: true },
            grid: { borderColor: '#f1f5f9', strokeDashArray: 3 }
        };

        const el = document.getElementById('religiao_chart');
        if (el) {
            el.innerHTML = '';
            new ApexCharts(el, options).render();
        }
    } catch (error) {
        console.error('Erro ao carregar religião:', error);
    }
}

// Eventos para filtros
document.addEventListener('DOMContentLoaded', function () {
    // ...existing code...

    // Faixa Etária
    document.getElementById('faixa_posto_select')?.addEventListener('change', carregarFaixaEtaria);
    document.getElementById('faixa_sexo_select')?.addEventListener('change', carregarFaixaEtaria);

    // Tempo de Serviço
    document.getElementById('tempo_posto_select')?.addEventListener('change', carregarTempoServico);
    document.getElementById('tempo_sexo_select')?.addEventListener('change', carregarTempoServico);

    // Residência Município
    document.getElementById('residencia_posto_select')?.addEventListener('change', carregarResidenciaMunicipio);
    document.getElementById('residencia_sexo_select')?.addEventListener('change', carregarResidenciaMunicipio);

    // Inicialização
    carregarFaixaEtaria();
    carregarTempoServico();
    carregarResidenciaMunicipio();
    carregarEstadoCivil();
    carregarOrientacaoSexual();
    carregarReligiao();
});
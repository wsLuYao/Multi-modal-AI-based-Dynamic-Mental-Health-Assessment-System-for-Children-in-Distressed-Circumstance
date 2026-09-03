 // 折线图
    new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: {
        labels: ['09/11','09/12','09/13','09/14','09/15','09/16','09/17','09/18','09/19','09/20'],
        datasets: [
          { label: '心率（HR）', data: [30,50,65,40,70,55,60,45,75,65], borderColor: '#eb4263', fill: false },
          { label: '心率变异性（HRV）', data: [40,60,55,30,60,45,35,50,30,25], borderColor: '#920b26ff', fill: false }
        ]
      }
    });

    // 柱状图
    new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: ['0-6','7-12','13-18','19-24'],
        datasets: [{ label: '人数', data: [40,90,60,40], backgroundColor: '#1E90FF' }]
      }
    });

    // 饼图1
    new Chart(document.getElementById('pie1'), {
      type: 'pie',
      data: {
        labels: ['良好','待改进'],
        datasets: [{ data: [82,18], backgroundColor: ['#1E90FF','#7EE7C3'] }]
      }
    });

    // 饼图2
    new Chart(document.getElementById('pie2'), {
      type: 'pie',
      data: {
        labels: ['良好','待改进'],
        datasets: [{ data: [73,27], backgroundColor: ['#1E90FF','#7EE7C3'] }]
      }
    });

    // 饼图3
    new Chart(document.getElementById('pie3'), {
      type: 'pie',
      data: {
        labels: ['良好','待改进'],
        datasets: [{ data: [60,40], backgroundColor: ['#1E90FF','#7EE7C3'] }]
      }
    });

    // 雷达图
    new Chart(document.getElementById('radarChart'), {
      type: 'radar',
      data: {
        labels: ['监护缺失（孤独茧）', '重病残疾（重伤茧）', '家庭困难（困窘茧）', '受虐茧（遭受虐待/忽视）', '失足茧（行为越轨）'],
        datasets: [{
          label: '困境类型分析',
          data: [80, 70, 85, 75, 90],
          backgroundColor: 'rgba(30,144,255,0.2)',
          borderColor: '#1E90FF',
          pointBackgroundColor: '#1E90FF'
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: 1500,
          easing: 'easeOutBounce'
        },
        scales: {
          r: {
            angleLines: { display: true },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
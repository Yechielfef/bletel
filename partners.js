/* Bletel advertiser logos (home page).
   To add a logo: put a transparent PNG in /img/partners/ and add its file name below.
   To remove one: delete its line. The two rows split automatically. */
window.BLETEL_PARTNERS = [
  "logo_001.png",
  "logo_105.png",
  "logo_059.png",
  "logo_002.png",
  "logo_060.png",
  "logo_003.png",
  "logo_061.png",
  "logo_004.png",
  "logo_062.png",
  "logo_005.png",
  "logo_063.png",
  "logo_006.png",
  "logo_064.png",
  "logo_007.png",
  "logo_065.png",
  "logo_008.png",
  "logo_066.png",
  "logo_009.png",
  "logo_102.png",
  "logo_010.png",
  "logo_068.png",
  "logo_011.png",
  "logo_069.png",
  "logo_012.png",
  "logo_070.png",
  "logo_013.png",
  "logo_103.png",
  "logo_071.png",
  "logo_014.png",
  "logo_072.png",
  "logo_015.png",
  "logo_073.png",
  "logo_016.png",
  "logo_074.png",
  "logo_017.png",
  "logo_075.png",
  "logo_018.png",
  "logo_076.png",
  "logo_019.png",
  "logo_077.png",
  "logo_020.png",
  "logo_078.png",
  "logo_021.png",
  "logo_079.png",
  "logo_022.png",
  "logo_080.png",
  "logo_023.png",
  "logo_081.png",
  "logo_024.png",
  "logo_082.png",
  "logo_025.png",
  "logo_083.png",
  "logo_026.png",
  "logo_084.png",
  "logo_027.png",
  "logo_085.png",
  "logo_028.png",
  "logo_086.png",
  "logo_029.png",
  "logo_087.png",
  "logo_030.png",
  "logo_088.png",
  "logo_031.png",
  "logo_089.png",
  "logo_032.png",
  "logo_090.png",
  "logo_033.png",
  "logo_091.png",
  "logo_034.png",
  "logo_092.png",
  "logo_035.png",
  "logo_093.png",
  "logo_036.png",
  "logo_094.png",
  "logo_037.png",
  "logo_095.png",
  "logo_038.png",
  "logo_104.png",
  "logo_096.png",
  "logo_039.png",
  "logo_097.png",
  "logo_040.png",
  "logo_098.png",
  "logo_041.png",
  "logo_099.png",
  "logo_042.png",
  "logo_100.png",
  "logo_043.png",
  "logo_101.png",
  "logo_044.png",
  "logo_045.png",
  "logo_046.png",
  "logo_047.png",
  "logo_048.png",
  "logo_049.png",
  "logo_050.png",
  "logo_051.png",
  "logo_052.png",
  "logo_053.png",
  "logo_054.png",
  "logo_055.png",
  "logo_056.png",
  "logo_057.png",
  "logo_058.png"
];
(function(){
  var list = window.BLETEL_PARTNERS || [];
  var box = document.getElementById('partners-rows');
  if (!box || !list.length) return;
  function dims(){
    var w = window.innerWidth;
    if (w < 600) return {cw: 74, ch: 28};
    if (w < 1000) return {cw: 94, ch: 33};
    return {cw: 106, ch: 36};
  }
  function fit(img){
    if (!img.naturalWidth) return;
    var d = dims(), r = img.naturalWidth / img.naturalHeight;
    var area = d.cw * d.ch * 0.40;
    var w = Math.sqrt(area * r), h = Math.sqrt(area / r);
    if (w > d.cw) { w = d.cw; h = w / r; }
    if (h > d.ch) { h = d.ch; w = h * r; }
    img.style.width = w.toFixed(1) + 'px';
    img.style.height = h.toFixed(1) + 'px';
  }
  var half = Math.ceil(list.length / 2);
  [list.slice(0, half), list.slice(half)].forEach(function(items, i){
    var row = document.createElement('div');
    row.className = 'pt-row ' + (i ? 'pt-right' : 'pt-left');
    var track = document.createElement('div');
    track.className = 'pt-track';
    for (var copy = 0; copy < 2; copy++) {
      items.forEach(function(name){
        var cell = document.createElement('span');
        cell.className = 'pt-cell';
        var img = document.createElement('img');
        img.alt = copy ? '' : name.replace(/\.png$/,'');
        img.decoding = 'async';
        img.onload = function(){ fit(img); };
        img.src = '/img/partners/' + name;
        if (copy) cell.setAttribute('aria-hidden','true');
        cell.appendChild(img);
        track.appendChild(cell);
      });
    }
    track.style.animationDuration = (items.length * 3) + 's';
    row.appendChild(track);
    box.appendChild(row);
  });
  var t; window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(function(){
    box.querySelectorAll('img').forEach(fit); }, 200); });
})();

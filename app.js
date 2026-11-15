// Kharcha download page. Finds the newest release and points the buttons at its real files.
const REPO = 'cantcodeforshit/kharcha-downloads';
const FALLBACK = {
  mac: `https://github.com/${REPO}/releases/latest/download/Kharcha-mac-apple-silicon.dmg`,
  win: `https://github.com/${REPO}/releases/latest/download/Kharcha-windows.exe`,
};
const $ = id => document.getElementById(id);

function guessOS() {
  const ua = navigator.userAgent || '';
  if (/Windows/i.test(ua)) return 'win';
  if (/Mac/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)) return 'mac';
  return '';
}
function showTab(os) {
  for (const k of ['mac', 'win']) {
    $('tab-' + k).classList.toggle('on', k === os);
    $('steps-' + k).hidden = k !== os;
  }
}
function markMine(os) {
  if (!os) return;
  $('card-' + os).classList.add('me');
  $('tag-' + os).hidden = false;
}

document.addEventListener('DOMContentLoaded', async () => {
  const mine = guessOS();
  markMine(mine);
  showTab(document.body.dataset.os || mine || 'mac');
  $('tab-mac').onclick = () => showTab('mac');
  $('tab-win').onclick = () => showTab('win');
  $('dl-mac').href = FALLBACK.mac;
  $('dl-win').href = FALLBACK.win;

  try {
    let r;
    try { r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } }); }
    catch (e) { $('status').textContent = ''; return; }              // offline or blocked: the buttons still use the direct links
    if (r.status === 404) throw new Error('none');
    if (!r.ok) return;                                  // rate-limited or offline: the fallback links still work
    const rel = await r.json();
    const files = rel.assets || [];
    const mac = files.find(a => /\.dmg$/i.test(a.name) && /apple|arm/i.test(a.name)) || files.find(a => /\.dmg$/i.test(a.name));
    const intel = files.find(a => /\.dmg$/i.test(a.name) && /intel/i.test(a.name));
    const win = files.find(a => /\.exe$/i.test(a.name));
    if (mac) $('dl-mac').href = mac.browser_download_url;
    if (win) $('dl-win').href = win.browser_download_url;
    if (intel) { $('intel').hidden = false; $('intel-link').href = intel.browser_download_url; }
    $('status').textContent = `Latest version: ${rel.tag_name}`;
    if (!mac) $('dl-mac').classList.add('off');
    if (!win) $('dl-win').classList.add('off');
    if (!mac || !win) $('status').textContent += ` · the ${!mac ? 'Mac' : 'Windows'} file isn't ready yet. Please check back soon.`;
  } catch (e) {
    $('status').textContent = "The download isn't published yet. Please check back soon or message Sylvin.";
    $('status').classList.add('warn');
    $('dl-mac').classList.add('off'); $('dl-win').classList.add('off');
  }
});

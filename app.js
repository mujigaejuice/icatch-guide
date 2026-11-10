(function () {

  var deck = document.getElementById("deck");
  var slides = Array.prototype.slice.call(deck.children);
  var bar = document.getElementById("bar");
  var count = document.getElementById("count");
  var section = document.getElementById("section");
  var prev = document.getElementById("prev");
  var next = document.getElementById("next");
  var total = slides.length;
  var current = 0;

  /* 진행 표시 */
  function render(i) {
    current = i;
    bar.style.width = ((i + 1) / total * 100) + "%";
    count.textContent = (i + 1) + " / " + total;
    section.textContent = slides[i].getAttribute("data-section") || "아이캐치";
    prev.disabled = i === 0;
    next.disabled = i === total - 1;
    try { history.replaceState(null, "", i === 0 ? location.pathname : "#" + (i + 1)); } catch (e) {}
  }

  function indexNow() {
    return Math.max(0, Math.min(total - 1, Math.round(deck.scrollLeft / deck.clientWidth)));
  }

  var ticking = false;
  deck.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var i = indexNow();
      if (i !== current) render(i);
    });
  }, { passive: true });

  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    deck.scrollTo({ left: i * deck.clientWidth, behavior: "smooth" });
  }
  prev.addEventListener("click", function () { go(current - 1); });
  next.addEventListener("click", function () { go(current + 1); });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.hidden) { if (e.key === "Escape") closeBox(); return; }
    if (e.key === "ArrowRight") go(current + 1);
    else if (e.key === "ArrowLeft") go(current - 1);
  });

  window.addEventListener("resize", function () {
    deck.scrollTo({ left: current * deck.clientWidth });
  });

  /* 긴 스크린샷은 아래를 흐리게 처리 */
  slides.forEach(function (s) {
    var shot = s.querySelector(".shot");
    if (!shot) return;
    var img = shot.querySelector("img");
    var check = function () {
      shot.classList.toggle("clipped", shot.scrollHeight > shot.clientHeight + 4);
    };
    if (img.complete) check(); else img.addEventListener("load", check);
    window.addEventListener("resize", check);
  });

  /* 이미지 탭하면 크게 보기 */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  function openBox(src, alt) {
    lbImg.src = src; lbImg.alt = alt || "";
    lightbox.hidden = false;
    lightbox.querySelector(".lb-scroll").scrollTop = 0;
  }
  function closeBox() { lightbox.hidden = true; lbImg.removeAttribute("src"); }
  deck.addEventListener("click", function (e) {
    var shot = e.target.closest(".shot");
    if (shot) { var im = shot.querySelector("img"); openBox(im.currentSrc || im.src, im.alt); }
  });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.classList.contains("lb-close") || e.target.classList.contains("lb-scroll")) closeBox();
  });

  /* #번호로 바로 열기 (예: /#5) */
  var start = parseInt((location.hash || "").slice(1), 10);
  if (start > 1 && start <= total) {
    deck.style.scrollSnapType = "none";
    deck.scrollLeft = (start - 1) * deck.clientWidth;
    deck.style.scrollSnapType = "";
    render(start - 1);
  } else {
    render(0);
  }
})();

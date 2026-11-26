import { useEffect } from "preact/hooks";

/**
 * Mobile keyboard focus mode: while an on-screen keyboard is open, the page
 * gets `kb-open` on <html> so CSS can condense the chrome (slim header,
 * icon-only game bar, shorter game card) and give the typing area the space.
 *
 * Detection: an editable element is focused AND the viewport shrank by
 * >150px versus the largest height seen for the current orientation.
 * Two shrink flavors are covered:
 *  - Android Chrome with `interactive-widget=resizes-content`: the layout
 *    viewport itself shrinks (innerHeight drops).
 *  - iOS Safari / Android without resizes-content: the visual viewport
 *    shrinks while innerHeight stays (guard against pinch-zoom via scale).
 * A physical keyboard never shrinks the viewport, so tablets with one and
 * desktops keep the full chrome.
 */
export default function MobileKeyboardMode() {
  useEffect(() => {
    const vv = globalThis.visualViewport;
    let editableFocused = false;
    let maxLayoutHeight = globalThis.innerHeight;

    const shrinkPx = () => {
      const layoutH = globalThis.innerHeight;
      const visualH = vv ? vv.height : layoutH;
      // Pinch-zoom also shrinks the visual viewport — not a keyboard.
      const zoomed = vv ? vv.scale > 1.05 : false;
      const visualShrink = zoomed ? 0 : layoutH - visualH;
      const layoutShrink = maxLayoutHeight - layoutH;
      return Math.max(visualShrink, layoutShrink);
    };

    const update = () => {
      const open = editableFocused && shrinkPx() > 150;
      document.documentElement.classList.toggle("kb-open", open);
    };

    const onFocusIn = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "TEXTAREA" ||
          t.tagName === "INPUT" ||
          t.isContentEditable)
      ) {
        editableFocused = true;
        update();
      }
    };

    const onFocusOut = () => {
      editableFocused = false;
      // Small delay: moving focus between inputs must not flicker the chrome.
      globalThis.setTimeout(() => {
        if (!editableFocused) update();
      }, 80);
    };

    const onResize = () => {
      maxLayoutHeight = Math.max(maxLayoutHeight, globalThis.innerHeight);
      update();
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    if (vv) vv.addEventListener("resize", onResize);
    globalThis.addEventListener("resize", onResize);
    globalThis.addEventListener("orientationchange", () => {
      // Recalibrate once the rotation resize has settled.
      globalThis.setTimeout(() => {
        maxLayoutHeight = globalThis.innerHeight;
        update();
      }, 300);
    });

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      if (vv) vv.removeEventListener("resize", onResize);
      globalThis.removeEventListener("resize", onResize);
      document.documentElement.classList.remove("kb-open");
    };
  }, []);

  return null;
}

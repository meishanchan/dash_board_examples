(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.CrystalIcons = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  let idSeq = 0;

  function createEl(tag, attrs, children) {
    const el = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs || {})) el.setAttribute(key, value);
    for (const child of children || []) if (child) el.appendChild(child);
    return el;
  }

  function getDefs(uid) {
    function gradient(type, name, attrs, stops) {
      return createEl(type, { id: `${name}-${uid}`, ...attrs }, stops.map(([offset, color]) =>
        createEl('stop', { offset, 'stop-color': color })
      ));
    }
    return createEl('defs', null, [
      gradient('linearGradient', 'metal', { x1: '0%', y1: '0%', x2: '75%', y2: '100%' }, [
        ['0%', '#ffffff'], ['19%', '#d7dbe0'], ['38%', '#a5abb3'],
        ['50%', '#666d77'], ['63%', '#b7bec7'], ['80%', '#edf0f4'], ['100%', '#787f89']
      ]),
      gradient('linearGradient', 'rim', { x1: '0%', y1: '0%', x2: '100%', y2: '100%' }, [
        ['0%', '#f5f6f8'], ['19%', '#aab0b6'], ['42%', '#4c525a'],
        ['66%', '#b0b5bb'], ['82%', '#e1e3e7'], ['100%', '#555a63']
      ]),
      gradient('linearGradient', 'edge', { x1: '0%', y1: '0%', x2: '15%', y2: '100%' }, [
        ['0%', '#ffffff'], ['35%', '#d4d8df'], ['65%', '#626973'], ['100%', '#252b33']
      ]),
      gradient('linearGradient', 'light', { x1: '0%', y1: '0%', x2: '80%', y2: '100%' }, [
        ['0%', '#ffffff'], ['50%', '#bfc4cb'], ['100%', '#e8e9ed']
      ]),
      gradient('radialGradient', 'face', { cx: '31%', cy: '19%', r: '90%' }, [
        ['0%', '#565b63'], ['50%', '#292d34'], ['100%', '#101217']
      ]),
      createEl('filter', { id: `shadow-${uid}`, x: '-25%', y: '-25%', width: '160%', height: '170%', 'color-interpolation-filters': 'sRGB' }, [
        createEl('feDropShadow', { dx: '.4', dy: '1', stdDeviation: '.65', 'flood-color': '#000000', 'flood-opacity': '.7' })
      ])
    ]);
  }

  function metal(tag, attrs, uid) {
    return createEl('g', null, [
      createEl(tag, { ...attrs, fill: '#3e444d', stroke: '#15191e', 'stroke-width': '.8', transform: `translate(.55 1) ${attrs.transform || ''}` }),
      createEl(tag, { ...attrs, fill: `url(#metal-${uid})`, stroke: `url(#edge-${uid})`, 'stroke-width': '.65', 'stroke-linejoin': 'round' })
    ]);
  }

  function line(d, uid, width = 1.6) {
    return createEl('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      createEl('path', { d, stroke: '#14181e', 'stroke-width': width + 1, transform: 'translate(.5 .8)' }),
      createEl('path', { d, stroke: `url(#light-${uid})`, 'stroke-width': width })
    ]);
  }

  function detail(d, attrs) {
    return createEl('path', { d, fill: 'none', stroke: '#f4f6f9', 'stroke-width': '.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs });
  }

  function medallion(uid, bright) {
    return [
      createEl('ellipse', { cx: '16.5', cy: '16.8', rx: '12.8', ry: '13', fill: '#07090c', opacity: '.8' }),
      createEl('ellipse', { cx: '15.8', cy: '15.2', rx: '12.6', ry: '13.2', fill: `url(#rim-${uid})`, stroke: '#171b21', 'stroke-width': '.55' }),
      createEl('ellipse', { cx: '15.8', cy: '15.2', rx: '11.7', ry: '12.3', fill: 'none', stroke: '#eff1f5', 'stroke-opacity': '.7', 'stroke-width': '.4' }),
      createEl('ellipse', { cx: '15.95', cy: '15.4', rx: '10.55', ry: '11.1', fill: `url(#${bright ? 'metal' : 'face'}-${uid})`, stroke: '#1b1d23', 'stroke-width': '.8' }),
      createEl('ellipse', { cx: '15.95', cy: '15.4', rx: '10.1', ry: '10.65', fill: 'none', stroke: '#c5c9d0', 'stroke-opacity': '.7', 'stroke-width': '.4' }),
      detail('M6.5 11.2C8 4.2 14.5 2.7 20 5.7', { 'stroke-width': '.65', opacity: '.8' }),
      detail('M9 23.7C15 28.2 22 23.7 24.5 18.7', { stroke: '#d4d8dd', 'stroke-width': '.4', opacity: '.55' })
    ];
  }

  function getShape(name, uid) {
    switch (name) {
      case 'quote':
        return [
          metal('path', { d: 'M13.7 5.5C8.1 7.5 4.8 11.6 4.4 17.3C4 21.2 6 25.6 9.3 25.6C12 25.6 14.2 23.5 14.2 20.8C14.2 17.4 11.9 15.7 9.1 15.3C9.5 11.7 11.3 8.3 13.7 5.5Z' }, uid),
          metal('path', { d: 'M27.7 5.5C22.1 7.5 18.8 11.6 18.4 17.3C18 21.2 20 25.6 23.3 25.6C26 25.6 28.2 23.5 28.2 20.8C28.2 17.4 25.9 15.7 23.1 15.3C23.5 11.7 25.3 8.3 27.7 5.5Z' }, uid),
          detail('M11.3 8.4C7.4 11.4 6.4 16.6 6.7 19.2M25.3 8.4C21.4 11.4 20.4 16.6 20.7 19.2', { opacity: '.8' })
        ];
      case 'bulb':
        return [
          metal('path', { d: 'M16 3.5a8.2 8.2 0 0 0-5.5 14.3c1.9 1.7 2.4 3.2 2.6 5.4h5.8c.2-2.2.7-3.7 2.6-5.4A8.2 8.2 0 0 0 16 3.5Z' }, uid),
          createEl('ellipse', { cx: '14', cy: '8.9', rx: '3.3', ry: '4.1', fill: '#ffffff', opacity: '.7', transform: 'rotate(25 14 8.9)' }),
          detail('M15.2 21L13.5 14.6M16.8 21l1.7-6.4', { stroke: '#606872', 'stroke-width': '.7' }),
          metal('path', { d: 'M12.8 23.1h6.4v3.8l-1.7 1.6h-3l-1.7-1.6Z' }, uid),
          detail('M13.1 24.5h5.8m-5.8 1.6h5.8', { stroke: '#414851', 'stroke-width': '.7' })
        ];
      case 'clock':
        return [
          ...medallion(uid, false),
          line('M15.5 7.7v7.5l6 4', uid, 1.65),
          createEl('circle', { cx: '15.5', cy: '15.2', r: '.9', fill: '#e7e9ed' })
        ];
      case 'check':
        return [
          ...medallion(uid, true),
          detail('M9.4 15.3l4.2 4.1 8.3-8.9', { stroke: '#f8fafc', 'stroke-width': '3.1', transform: 'translate(0 .6)' }),
          detail('M9.4 14.7l4.2 4.1 8.3-8.9', { stroke: '#20252d', 'stroke-width': '2.7' })
        ];
      case 'trophy':
        return [
          line('M10 7H5.5v4.5c0 3.8 2.4 5.7 6.3 6M22 7h4.5v4.5c0 3.8-2.4 5.7-6.3 6', uid, 2.1),
          metal('path', { d: 'M9 4.7h14l-.9 9.1c-.5 4.2-2.6 6.8-6.1 6.8s-5.6-2.6-6.1-6.8Z' }, uid),
          createEl('path', { d: 'M12 6.2h3.1l1.1 11.5c-3-1-4-5.2-4.2-11.5Z', fill: '#f3f5f8', opacity: '.55' }),
          metal('path', { d: 'M14.6 20.3h2.8v4l3.3 1.6v1.7h-9.4v-1.7l3.3-1.6Z' }, uid),
          detail('M11.5 27.5h9', { 'stroke-width': '.7' })
        ];
      case 'inbox':
        return [
          metal('path', { d: 'M7.3 6.8h17.4l3.1 13.3-3.1 6H7.3l-3.1-6Z' }, uid),
          createEl('path', { d: 'M8.8 8.7h14.4l2.1 9.5h-6.1l-1.3 3h-3.8l-1.3-3H6.7Z', fill: `url(#face-${uid})`, stroke: '#f1f4f7', 'stroke-width': '.7' }),
          metal('path', { d: 'M4.8 18.4h7.8l1.6 3.4h3.6l1.6-3.4h7.8v5a3.1 3.1 0 0 1-3.1 3.1H7.9a3.1 3.1 0 0 1-3.1-3.1Z' }, uid),
          detail('M8.1 24.5h15.8', { opacity: '.7' })
        ];
      case 'calendar':
        return [
          metal('rect', { x: '4.8', y: '6.9', width: '22.4', height: '21.1', rx: '2.8' }, uid),
          createEl('rect', { x: '6.6', y: '12', width: '18.8', height: '14', rx: '1.4', fill: `url(#face-${uid})`, stroke: '#d2d6dc', 'stroke-width': '.45' }),
          line('M10 4.4v5.8M22 4.4v5.8', uid, 1.9),
          ...[10.5, 16, 21.5].flatMap(cx => [16, 20.9].map(cy => createEl('rect', { x: cx - 1, y: cy - 1, width: '2', height: '2', rx: '.3', fill: '#d8dce2' })))
        ];
      case 'folder':
        return [
          line('M11 8V5.8a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 21 5.8V8', uid, 1.8),
          metal('path', { d: 'M5.8 8h20.4a2 2 0 0 1 2 2v15.3a2 2 0 0 1-2 2H5.8a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z' }, uid),
          metal('path', { d: 'M3.8 9.5h24.4v5.2l-9 4h-6.4l-9-4Z' }, uid),
          createEl('rect', { x: '13.8', y: '16.8', width: '4.4', height: '3.5', rx: '.8', fill: `url(#light-${uid})`, stroke: '#535b65', 'stroke-width': '.7' }),
          detail('M6.5 24.8h19', { opacity: '.5' })
        ];
      case 'book':
        return [
          metal('path', { d: 'M3.7 6.2c3.6-1.3 7.6-.9 11.3 1.4V27c-3.7-2.2-7.7-2.7-11.3-1.4Z' }, uid),
          metal('path', { d: 'M28.3 6.2c-3.6-1.3-7.6-.9-11.3 1.4V27c3.7-2.2 7.7-2.7 11.3-1.4Z' }, uid),
          detail('M6.1 8.5c2.2-.3 4.2.2 6.5 1.3v12.6M25.9 8.5c-2.2-.3-4.2.2-6.5 1.3v12.6', { opacity: '.75' }),
          line('M16 9v17', uid, '.8')
        ];
      case 'tag':
        return [
          metal('path', { d: 'M4.5 4.5h10.3l13 13a2.6 2.6 0 0 1 0 3.7l-6.6 6.6a2.6 2.6 0 0 1-3.7 0l-13-13Z' }, uid),
          createEl('circle', { cx: '9.6', cy: '9.6', r: '2.25', fill: '#20252b', stroke: '#e9ecf1', 'stroke-width': '.9' }),
          detail('M6.2 13.5l12.5 12.2', { opacity: '.5' })
        ];
      case 'search':
        return [
          line('M19.7 19.7l7 7', uid, 3.2),
          metal('circle', { cx: '13.3', cy: '13.3', r: '9.5' }, uid),
          createEl('circle', { cx: '13.3', cy: '13.3', r: '6.9', fill: `url(#face-${uid})`, stroke: '#eef1f5', 'stroke-width': '.65' }),
          detail('M8.2 12.2a5.6 5.6 0 0 1 7.1-4.3', { 'stroke-width': '.9', opacity: '.85' })
        ];
      case 'plus':
        return [detail('M16 7v18M7 16h18', { stroke: 'currentColor', 'stroke-width': '2.5' })];
      case 'clipboard':
        return [
          metal('rect', { x: '5.3', y: '6.9', width: '21.4', height: '21', rx: '2.4' }, uid),
          createEl('rect', { x: '7.5', y: '10.3', width: '17', height: '15.2', rx: '.8', fill: `url(#face-${uid})`, stroke: '#a4abb4', 'stroke-width': '.5' }),
          metal('path', { d: 'M12 4.4h8l1 5.2H11Z' }, uid),
          line('M10.6 14.8h10.8M10.6 18.8h8M10.6 22.8h9.7', uid, 1.1)
        ];
      case 'gear':
        return [
          metal('path', { d: 'M13.5 3h5l.8 3.2 2.7 1.2 2.9-1.6 3.5 3.5-1.6 2.9 1.2 2.7 3 .8v5l-3 .8-1.2 2.7 1.6 2.9-3.5 3.5-2.9-1.6-2.7 1.2-.8 3.1h-5l-.8-3.1-2.7-1.2-2.9 1.6-3.5-3.5L5.2 24 4 21.3l-3-.8v-5l3-.8 1.2-2.7-1.6-2.9 3.5-3.5L10 7.2 12.7 6Z', transform: 'translate(2 0) scale(.875)' }, uid),
          createEl('circle', { cx: '16', cy: '16', r: '6.1', fill: `url(#rim-${uid})`, stroke: '#f7f9fc', 'stroke-width': '.65' }),
          createEl('circle', { cx: '16', cy: '16', r: '3.8', fill: `url(#face-${uid})`, stroke: '#555e69', 'stroke-width': '.7' }),
          detail('M12.2 12.4a5.2 5.2 0 0 1 6.8-.6', { opacity: '.8' })
        ];
      case 'target':
        return [
          metal('circle', { cx: '14.7', cy: '17', r: '11.2' }, uid),
          createEl('circle', { cx: '14.7', cy: '17', r: '8.6', fill: `url(#face-${uid})`, stroke: '#4b535e', 'stroke-width': '.65' }),
          createEl('circle', { cx: '14.7', cy: '17', r: '5.9', fill: 'none', stroke: `url(#light-${uid})`, 'stroke-width': '1.9' }),
          createEl('circle', { cx: '14.7', cy: '17', r: '2.1', fill: '#c5cbd3' }),
          line('M14.7 17L26.8 4.8M23.5 4.7l3.5-.8-.8 3.5', uid, 1.9)
        ];
      case 'file':
        return [
          metal('path', { d: 'M7.5 3.7h10.7l7.4 7.4v15a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2V5.7a2 2 0 0 1 2-2Z' }, uid),
          createEl('path', { d: 'M18.2 3.7v7.4h7.4Z', fill: `url(#light-${uid})`, stroke: '#626a75', 'stroke-width': '.6' }),
          detail('M9.2 15.3h11.5M9.2 19.2h11.5M9.2 23.1h8.2', { stroke: '#515964', 'stroke-width': '1.2' })
        ];
      case 'left':
        return [detail('M19 10l-6 6 6 6', { stroke: 'currentColor', 'stroke-width': '2.1' })];
      case 'right':
        return [detail('M13 10l6 6-6 6', { stroke: 'currentColor', 'stroke-width': '2.1' })];
      case 'more':
        return [10, 16, 22].map(cx => createEl('circle', { cx, cy: '16', r: '1.6', fill: 'currentColor' }));
      case 'close':
        return [detail('M11 11l10 10M21 11L11 21', { stroke: 'currentColor', 'stroke-width': '2' })];
      default:
        return [metal('circle', { cx: '16', cy: '16', r: '5' }, uid)];
    }
  }

  function icon(name, size = 32) {
    const uid = `hp2-icon-${++idSeq}`;
    const svg = createEl('svg', {
      viewBox: '0 0 32 32', width: String(size), height: String(size),
      'aria-hidden': 'true', focusable: 'false', class: `cd-icon cd-icon-${name}`
    });
    const restrained = ['left', 'right', 'more', 'close', 'plus'].includes(name);
    if (!restrained) svg.appendChild(getDefs(uid));
    const shapes = getShape(name, uid);
    const group = createEl('g', restrained ? null : { filter: `url(#shadow-${uid})` }, shapes);
    svg.appendChild(group);
    return svg;
  }

  return { icon };
});

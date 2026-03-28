/**
 * COFFEE OS ASCII banner (same art as COFFEE_VM2 / coffee.shell.BANNER_COFFEE_OS).
 * Load before any script that reads window.COFFEE_OS_ASCII_BANNER.
 *
 * Path from COFFEE-SOURCE/COFFEE-CASH/TEST/: ../COFFEE-BRAND/coffee-os-ascii.js
 */
(function (global) {
  'use strict';
  var BANNER =
    ' ██████╗  ██████╗ ███████╗███████╗███████╗███████╗     ██████╗ ███████╗\n' +
    '██╔════╝ ██╔═══██╗██╔════╝██╔════╝██╔════╝██╔════╝    ██╔═══██╗██╔════╝\n' +
    '██║      ██║   ██║█████╗  █████╗  █████╗  █████╗      ██║   ██║███████╗\n' +
    '██║      ██║   ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══╝      ██║   ██║╚════██║\n' +
    '╚██████╗ ╚██████╗██║     ██║     ███████╗███████╗    ╚██████╗███████║\n' +
    ' ╚═════╝  ╚═════╝╚═╝     ╚═╝     ╚══════╝╚══════╝     ╚═════╝╚══════╝';

  global.COFFEE_OS_ASCII_BANNER = BANNER;
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this);

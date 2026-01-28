// Virtual Scroll:
// - Fake height with spacer
// - Render only visible range
//   - Absolute positioning using index * itemHeight

// Infinite Scroll:
// - Watch scrollTop + containerHeight
//   - Load near bottom
//     - Guard with isLoading

// Performance:
// - Overscan for smoothness
//   - requestAnimationFrame for scroll




// dynamic height, visual menta model
// Item 0 → height 40 → offset 0
// Item 1 → height 70 → offset 40
// Item 2 → height 50 → offset 110
// Item 3 → height 90 → offset 160

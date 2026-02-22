# Toggle Switch for Challenge Cards

## Overview
Added a modern toggle switch UI to challenge cards for creators to easily activate/deactivate their toggle-type challenges.

## Changes Made

### File: `/src/components/challenges/ChallengeCard.tsx`

Replaced the text-based "On/Off" button with a visual toggle switch component.

## Toggle Switch Design

### Visual States

**Active State (ON):**
- Background: Blue (`bg-blue-500/80`)
- Toggle knob positioned on the right
- Smooth animation when switching

**Inactive State (OFF):**
- Background: Gray (`bg-slate-300/60`)
- Toggle knob positioned on the left
- Smooth animation when switching

### Features

✨ **Smooth Animations**
- 200ms transition for color changes
- 200ms transition for knob movement
- Feels responsive and polished

🎨 **Glassmorphism Styling**
- Semi-transparent backgrounds with backdrop blur
- Subtle borders matching the design system
- Consistent with other UI elements

🔍 **Accessibility**
- Focus ring when tabbed to (`focus:ring-2`)
- Hover tooltip showing "Turn on/off challenge"
- Semantic button element

📱 **Two Sizes**
- Default variant: `h-6 w-11` (larger)
- Compact variant: `h-5 w-9` (smaller)

## Code Structure

### Default Variant
```tsx
<button
  onClick={() => onToggle(challenge.id)}
  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
    challenge.toggle_details?.is_active
      ? "bg-blue-500/80 backdrop-blur-sm border border-blue-400/40"
      : "bg-slate-300/60 backdrop-blur-sm border border-slate-400/40"
  }`}
  title={challenge.toggle_details?.is_active ? "Turn off challenge" : "Turn on challenge"}
>
  <span
    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
      challenge.toggle_details?.is_active ? "translate-x-6" : "translate-x-1"
    }`}
  />
</button>
```

### Compact Variant
```tsx
<button
  onClick={() => onToggle(challenge.id)}
  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 ${
    challenge.toggle_details?.is_active
      ? "bg-blue-500/80 backdrop-blur-sm border border-blue-400/40"
      : "bg-slate-300/60 backdrop-blur-sm border border-slate-400/40"
  }`}
  title={challenge.toggle_details?.is_active ? "Turn off" : "Turn on"}
>
  <span
    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
      challenge.toggle_details?.is_active ? "translate-x-5" : "translate-x-1"
    }`}
  />
</button>
```

## Behavior

### Who Sees the Toggle?
- ✅ **Creators only** - Only the challenge creator can toggle their challenges
- ✅ **Toggle-type challenges only** - Only shows for challenges with `challenge_type === "toggle"`
- ✅ **When actions enabled** - Respects the `showActions` prop

### What Happens on Click?
1. User clicks the toggle switch
2. `onToggle(challenge.id)` is called
3. API request sent to backend to update challenge state
4. Challenge list refreshes to show new state
5. Toggle switch animates to new position
6. Status badge updates (🔵 Active ↔️ ⚪ Off)

## Visual Comparison

### Before (Text Button):
```
[Challenge Name] [🔵 Active] [You]  [On]
```
or
```
[Challenge Name] [⚪ Off] [You]  [Off]
```

### After (Toggle Switch):
```
[Challenge Name] [🔵 Active] [You]  [●―――]  ← Active (blue, knob on right)
```
or
```
[Challenge Name] [⚪ Off] [You]  [―――●]  ← Inactive (gray, knob on left)
```

## Design Tokens

### Dimensions
- **Default size**: `h-6 w-11` (24px × 44px)
- **Compact size**: `h-5 w-9` (20px × 36px)
- **Knob default**: `h-4 w-4` (16px)
- **Knob compact**: `h-3 w-3` (12px)

### Colors
- **Active background**: `bg-blue-500/80` with `border-blue-400/40`
- **Inactive background**: `bg-slate-300/60` with `border-slate-400/40`
- **Knob**: `bg-white` with `shadow-sm`

### Animations
- **Duration**: `200ms`
- **Properties**: `colors` and `transform`
- **Easing**: Default (ease)

### States
- **Default**: Normal state
- **Hover**: Implicit (no special hover state)
- **Focus**: `ring-2 ring-slate-500 ring-offset-2`
- **Active**: Button transforms on click

## Accessibility

✅ **Keyboard accessible** - Can be focused and activated with Enter/Space
✅ **Screen reader friendly** - Button element with title attribute
✅ **Visual feedback** - Focus ring for keyboard navigation
✅ **Clear state** - Visual difference between on/off is obvious

## Usage Example

The toggle automatically appears when:
1. Challenge is toggle-type
2. Current user is the creator
3. `onToggle` callback is provided
4. `showActions` is true

```tsx
<ChallengeCard
  challenge={toggleChallenge}
  onToggle={handleToggle}
  showActions={true}
/>
```

## Integration with ChallengeList

The `ChallengeList` component passes the `handleToggleChallenge` function:

```tsx
<ChallengeCard
  challenge={challenge}
  onToggle={currentTab === "created" ? handleToggleChallenge : undefined}
/>
```

This ensures:
- Toggle only shows on "Created by Me" tab
- API is called correctly
- List refreshes after toggle

## Browser Support

Works in all modern browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements:
- [ ] Add loading state during API call
- [ ] Add success/error animations
- [ ] Haptic feedback on mobile
- [ ] Keyboard shortcuts (e.g., Ctrl+T)
- [ ] Batch toggle multiple challenges
- [ ] Toggle confirmation for strict mode challenges

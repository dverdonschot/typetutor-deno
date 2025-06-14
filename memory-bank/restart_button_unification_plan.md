# Plan for Unifying Game Restart Button

## Objective

Unify the game restart button in the score display across all typing game modes (Random, Alphabet, Quote, Trigraphs) to a single button with a consistent appearance and behavior.

## Requirements

- A single restart button should be displayed in the score/completion area for all game modes.
- The button should have the `typetutor-light-blue` style.
- The button should be selectable using the Tab key.
- The button should be activatable using the Enter key when selected.
- Clicking or activating the button should restart the current game mode appropriately.

## Analysis

Based on the current codebase:

- The score display and restart button logic is not consistently implemented across all modes.
- `islands/KeyLogger.tsx` displays typing metrics and a "Reload Game" button upon completion for modes like Random.
- `islands/QuoteTyperMode.tsx` has its own completion message and "Practice Again" and "Next Random" buttons.
- Random mode (`islands/RandomSettings.tsx` which uses `KeyLogger`) currently shows two buttons upon completion: "Regenerate" (from `RandomSettings`) and "Reload Game" (from `KeyLogger`).
- The component for Alphabet mode needs to be investigated (`routes/alphabet.tsx`).
- The component for Trigraphs mode is likely `islands/TrigraphsTyperMode.tsx`.

The "score box" is not a single, shared island component as initially thought, but rather completion display logic present in different components.

## Plan

1.  **Create/Refactor a Shared Completion Display Component:**
    - Refactor the completion display logic currently in `islands/KeyLogger.tsx` into a new, dedicated component (e.g., `components/GameCompletionDisplay.tsx`).
    - This component will receive typing metrics and an `onRestart` function as props.
    - It will display the typing metrics and a single restart button.
    - The restart button will have the `typetutor-dark-blue` style.
    - The button's `onClick` handler will call the `onRestart` prop function.
    - Ensure the button is a standard HTML button element, which is naturally focusable with Tab and activatable with Enter.

2.  **Update `islands/KeyLogger.tsx`:**
    - Remove the score display and restart button logic.
    - `KeyLogger` will now focus solely on capturing input and calculating metrics, passing these metrics to its parent component.
    - It will no longer handle game completion state (`isFinished`) or send game stats.

3.  **Integrate `GameCompletionDisplay.tsx` into Game Mode Islands:**

    - **`islands/RandomSettings.tsx`:**
        - Modify `RandomSettings.tsx` to use the new `GameCompletionDisplay` component when the game is complete.
        - Pass the relevant metrics from `KeyLogger` to `GameCompletionDisplay`.
        - Pass an `onRestart` function to `GameCompletionDisplay` that regenerates the training set and resets the `KeyLogger` state.
        - Re-evaluate if the "Regenerate" button in `RandomSettings.tsx` is still necessary or if the single restart button in the completion display is sufficient for the user's needs. Based on the request for *one* button in the score box, the "Regenerate" button outside the score box can remain if it serves a different purpose (e.g., changing settings before starting).

    - **`islands/QuoteTyperMode.tsx`:**
        - Remove the existing completion message `div` and its buttons ("Practice Again", "Next Random").
        - Modify `QuoteTyperMode.tsx` to use the new `GameCompletionDisplay` component when a quote (or all quotes) is completed.
        - Pass the relevant metrics to `GameCompletionDisplay`.
        - Pass an `onRestart` function to `GameCompletionDisplay` that either resets the current quote's input or advances to the next quote, depending on the game state.
        - The logic for sending game stats when all quotes are completed will remain in `QuoteTyperMode.tsx`.

    - **Alphabet Mode Component:**
        - Investigate `routes/alphabet.tsx` to identify the main component for Alphabet mode.
        - Integrate the `GameCompletionDisplay` component into the Alphabet mode component.
        - Pass relevant metrics and an appropriate `onRestart` function.

    - **`islands/TrigraphsTyperMode.tsx`:**
        - Modify `islands/TrigraphsTyperMode.tsx` to use the new `GameCompletionDisplay` component when the game is complete.
        - Pass relevant metrics and an appropriate `onRestart` function.

4.  **Refine Styling and Accessibility:**
    - Ensure the `typetutor-light-blue` style is correctly applied using Tailwind CSS classes.
    - Verify that the button is focusable with Tab and activatable with Enter.

## Next Steps

1.  Switch to "Code" mode to perform code modifications.
2.  Create the new `components/GameCompletionDisplay.tsx` component.
3.  Refactor `islands/KeyLogger.tsx`.
4.  Integrate `GameCompletionDisplay` into `islands/RandomSettings.tsx`.
5.  Integrate `GameCompletionDisplay` into `islands/QuoteTyperMode.tsx`.
6.  Investigate and modify the Alphabet mode component (`routes/alphabet.tsx` or related).
7.  Integrate `GameCompletionDisplay` into `islands/TrigraphsTyperMode.tsx`.
8.  Test all game modes to ensure the single restart button works correctly and has the desired appearance and behavior.
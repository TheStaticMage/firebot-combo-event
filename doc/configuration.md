# Configuration

## Setting Up a Combo Event

Once the plugin is installed and Firebot has restarted, you can create event handlers for Combo events.

### Creating an Event Handler

1. Go to **Events**
2. Click **Add New Event**
3. Select **Combo** as the event
4. (Optional) Add filters to your event. You can use the **Cheer Bits Amount** filter to trigger effects only when a specific number of bits were cheered in the combo.
5. Click **Save**

The event is now active and ready to trigger effects.

## Adding Effects

When a Combo event is triggered, you can add various effects to respond to your viewers. Here are common examples:

### Chat Message

A simple way to acknowledge your viewer's combo:

1. Click **Add Effect**
2. Select **Chat** > **Send Message**
3. Enter a message. You can use the `$cheerBitsAmount` variable to reference how many bits were cheered. For example: `Thanks @$username for the $cheerBitsAmount bit combo!`
4. Click **Save**

### Alert (Chat Feed)

Display an alert in your activity feed:

1. Click **Add Effect**
2. Select **Chat Feed Alert**
3. Configure the alert message and styling as desired
4. Click **Save**

## Available Variables

The Combo event provides the following variables for use in effects:

- `$username`: The username of the person who cheered
- `$userDisplayName`: The display name of the person who cheered
- `$cheerBitsAmount`: The number of bits cheered in the combo

These variables can be used in chat messages, alerts, and other text fields throughout Firebot effects.

## Tips

- If you have multiple combo events happening quickly, consider using the [Firebot Rate Limiter](https://github.com/TheStaticMage/firebot-rate-limiter) plugin to avoid overwhelming your chat or overlays.
- You can create different effect chains for different bit amounts using the **Cheer Bits Amount** filter.

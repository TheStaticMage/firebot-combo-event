# Firebot Combo Event

## Introduction

This [Firebot](https://firebot.app) integration helps to support the ["Combo"](https://help.twitch.tv/s/article/combos) bits cheering event on Twitch. This is intended to be a temporary workaround until proper support for combos is added to Firebot. As per [this feature request issue](https://github.com/crowbartools/Firebot/issues/3176), combos will be added to Firebot only when they are no longer considered beta by Twitch.

This integration provides:

- A "Combo" event
- Support for the "Cheer Bits Amount" filter in that "Combo" event
- Support for the `$cheerBitsAmount` variable in that "Combo" event

When people use a combo, they are sending small cheers of a predefined amount (e.g. 5 bits) at a time. The combo event in Firebot will fire once for each time someone clicks on the combo button (which may be a heart, dinosaur, horse, or whatever). Hopefully this will result in a lot of clicks from your viewers! However, if you have an elaborate setup to recognize cheers, such as a long sound or on-screen animation, you might want to consider an approach (like my [Firebot Rate Limiter](https://github.com/TheStaticMage/firebot-rate-limiter)) to avoid being overwhelmed.

:warning: When/if support for combos is added to Firebot, I will no longer support this script. At that time, you will need to migrate to the implementation provided by Firebot, which will not necessarily be backward compatible with this. In other words, you may need to update or redo any effect lists or event handlers that you create using this event.

## Installation

:warning: **This script requires Firebot 5.65 or higher. At present, you'll need to use a [nightly build](https://github.com/crowbartools/firebot-nightly/releases).**

The script needs to be installed like any other Firebot startup script:

1. From the latest [Release](https://github.com/TheStaticMage/firebot-combo-event/releases), download `firebot-combo-event-<version>.js` and copy it into your Firebot scripts directory (File &gt; Open Data Folder, then select the "scripts" directory).

2. Enable custom scripts in Firebot (Settings &gt; Scripts) if you have not already done so.

3. Add the `firebot-combo-event-<version>.js` script that you just added as a startup script (Settings &gt; Scripts &gt; Manage Startup Scripts &gt; Add New Script).

4. Restart Firebot.

## Upgrading

The script needs to be upgraded like any other Firebot startup script:

1. From the latest [Release](https://github.com/TheStaticMage/firebot-combo-event/releases), download `firebot-combo-event-<version>.js` and copy it into your Firebot scripts directory (File &gt; Open Data Folder, then select the "scripts" directory).

2. Go in to Settings &gt; Scripts &gt; Manage Startup Scripts and click the **Edit** button next to this script. Select the correctly versioned script from the dropdown. (If necessary, click on the icon to refresh the directory contents.)

3. Restart Firebot.

## Support

The best way to get help is in my Discord server. Join the [The Static Discord](https://discord.gg/cjgax64bfw) and then visit the `#firebot-combo-event` channel there.

- Please do not DM me on Discord.
- Please do not ask for help in my chat when I am live on Twitch.

Bug reports and feature requests are welcome via [GitHub Issues](https://github.com/TheStaticMage/firebot-combo-event/issues).

:bulb: This script currently incorporates all of the information available from the Twitch "EventSub" event when a combo event is sent. This is likely "feature complete" unless Twitch changes the implementation, adds information to the existing event, or adds new events related to combos.

## Contributions

Contributions are welcome via [Pull Requests](https://github.com/TheStaticMage/firebot-combo-event/pulls). I _strongly suggest_ that you contact me before making significant changes, because I'd feel really bad if you spent a lot of time working on something that is not consistent with my vision for the project. Please refer to the [Contribution Guidelines](/.github/contributing.md) for specifics.

## License

This script is released under the [GNU General Public License version 3](/LICENSE). That makes it free to use whether your stream is monetized or not.

If you use this on your stream, I would appreciate a shout-out. (Appreciated, but not required.)

- <https://www.twitch.tv/thestaticmage>
- <https://kick.com/thestaticmage>
- <https://youtube.com/@thestaticmagerisk>

This script contains some code from [Firebot](https://github.com/crowbartools/Firebot) itself, which uses the same license.

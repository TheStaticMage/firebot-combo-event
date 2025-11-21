# Upgrading

## Versioning

- A **patch release** changes the last number (e.g. `0.0.3` -> `0.0.4`). These releases may fix bugs or add features, but your existing setup should continue to work just fine.
- A **minor release** changes the middle number (e.g. `0.0.4` -> `0.1.0`). These releases typically make considerable changes but are generally backward-compatible. Your existing setup should continue to work.
- A **major release** changes the first number (e.g. `0.1.5` -> `1.0.0`). These releases correspond to a major milestone and may contain breaking changes.

## Version Compatibility

| Plugin Version | Minimum Firebot Version |
| --- | --- |
| 0.0.1+ | 5.65 |

:warning: This plugin requires Firebot 5.65 or higher.

## Upgrade Procedure

1. From the latest [Release](https://github.com/TheStaticMage/firebot-combo-event/releases), download `firebot-combo-event-<version>.js` into your Firebot scripts directory (File > Open Data Folder, then select the "scripts" directory).

2. Go to Settings > **Scripts** > **Manage Startup Scripts** and click the **Edit** button next to this plugin. Select the correctly versioned script from the dropdown. (If necessary, click on the icon to refresh the directory contents.)

3. Restart Firebot.

## Upgrade Notes

Currently there are no breaking changes between versions.

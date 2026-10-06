# rsg-stables

Horse ownership and stables script for **RSG-Core** (RedM). Buy, stable, care for, customise and breed horses through a NUI stable menu, with persistent active horses that survive relogs and restarts.

**Version:** 2.0.7 · **Author:** RexShack

---

## Features

- **Multiple stables** – Valentine, Blackwater, Rhodes, Saint Denis and Strawberry out of the box, each with a stablehand NPC, map blip, preview spot and store point. Add your own in `Config.Stables`.
- **Buy horses** – large breed catalogue with price, class, handling and stat bars (health, stamina, speed, acceleration), plus filters by price band, and a live preview before purchase.
- **Stable management** – retrieve, store, rename, transfer between stables, insure and revive horses. Per-player and per-stable horse limits.
- **Whistle** – whistle (`INPUT_WHISTLE`) to call your active horse; if it's too far away it's moved near you instead of making the trek.
- **Active horse persistence** – the active horse's position is saved to the database. Log out or restart the resource and your horse is still "out" – whistle to bring it back.
- **Needs system** – hunger and thirst decay over time; starving/dehydrated horses lose health, well-fed horses slowly heal.
- **Horse care** – Feed, Water and Brush your horse via ox_target, with bonding gained from each.
- **Horse Stats** – view health, stamina, hunger, thirst, bonding and cleanliness.
- **Horse stimulant** – usable item that keeps stamina topped up, applies a golden fortify and an optional speed boost for a set duration.
- **Flee** – send your horse away; it either returns to the stable or stays checked out for whistle recall (configurable).
- **Insurance & death** – insured horses can be revived for a fee after dying.
- **Breeding** – breed two of your horses at a stable; collect the foal once the timer finishes.
- **Tack customisation** – blankets, saddles, saddlebags, horns, stirrups, bedrolls, manes, tails, masks, mustaches, holsters, bridles and horseshoes, each priced individually.
- **Multi-language** – every player-facing string (notifications, menus, target options and the NUI) is in `locales/*.json`. Ships with en, de, el, es, fr, ja, nl, pl, pt-br and ro.
- **Version checker** – notifies on startup when an update is available.

---

## Dependencies

- [rsg-core](https://github.com/Rexshack-RedM/rsg-core)
- [ox_lib](https://github.com/overextended/ox_lib)
- [ox_target](https://github.com/overextended/ox_target)
- [oxmysql](https://github.com/overextended/oxmysql)

---

## Installation

1. Download and place the `rsg-stables` folder in your server's `resources` directory (e.g. `resources/[rex]/rsg-stables`).
2. The database tables are created automatically, in one go, the first time the resource starts – no import needed. If you prefer to set them up yourself, import `installation/install.sql` (same schema) before starting. Either way you get two tables:
   - `rsg_stables_horses` – owned horses, stats, tack and state
   - `rsg_stables_breeding` – active breeding jobs
3. Add the items below to `rsg-core/shared/items.lua` (and matching images to your inventory resource) if you don't already have them:

   ```lua
   horse_apple     = { name = 'horse_apple',     label = 'Horse Apple',     weight = 100, type = 'item', image = 'horse_apple.png',     unique = false, useable = false, shouldClose = true, description = 'A tasty treat for your horse' },
   waterbucket     = { name = 'waterbucket',     label = 'Water Bucket',    weight = 500, type = 'item', image = 'waterbucket.png',     unique = false, useable = false, shouldClose = true, description = 'A bucket of water' },
   horse_brush     = { name = 'horse_brush',     label = 'Horse Brush',     weight = 100, type = 'item', image = 'horse_brush.png',     unique = false, useable = false, shouldClose = true, description = 'Used to groom your horse' },
   horse_stimulant = { name = 'horse_stimulant', label = 'Horse Stimulant', weight = 100, type = 'item', image = 'horse_stimulant.png', unique = false, useable = true,  shouldClose = true, description = 'Boosts your horse\'s stamina' },
   ```

4. Make sure dependencies start first, then add to your `server.cfg`:

   ```cfg
   ensure ox_lib
   ensure oxmysql
   ensure rsg-core
   ensure ox_target
   ensure rsg-stables
   ```

5. Restart your server.

> If you remove another stables/horse resource, make sure it's no longer started to avoid conflicts.

---

## Configuration

All settings live in `shared/config.lua`.

### General

| Option | Default | Description |
|---|---|---|
| `Config.Locale` | `'en'` | Locale file from `locales/` |
| `Config.MaxOwnedHorses` | `8` | Max horses one player can own |
| `Config.MaxHorsesPerStable` | `20` | Max horses stored at one stable |
| `Config.RenameCost` | `15` | Cost to rename a horse |
| `Config.InsuranceCost` | `25` | Cost to insure a horse |
| `Config.ReviveCost` | `40` | Cost to revive a dead horse |
| `Config.StoreDistance` | `8.0` | Max distance of your horse from the stable to store it |
| `Config.PaymentAccount` | `'cash'` | `'cash'` or `'bank'` |
| `Config.WhistleTeleportDistance` | `60.0` | Beyond this distance a whistled horse is moved near you |
| `Config.AllowTwoPlayersRide` | `false` | Allow a passenger on horseback |

### Active horse persistence – `Config.ActiveHorse`

| Option | Default | Description |
|---|---|---|
| `saveInterval` | `10000` | ms between position saves |
| `minMoveToSave` | `2.0` | Min movement before saving again |
| `recallMaxDistance` | `150.0` | Within this range the horse spawns at its saved position and travels to you |
| `respawnDistance` | `30.0` | Otherwise it spawns this far behind you |
| `minSpawnDistance` | `25.0` | Never spawn closer than this |
| `notifyOnLogin` | `true` | Remind the player on login that their horse is out |

### Feeding & watering

```lua
Config.HorseFeedItems  = { { item = 'horse_apple', label = 'Horse Apple', health = 10, stamina = 10, hunger = 15 } }
Config.HorseDrinkItems = { { item = 'waterbucket', label = 'Water Bucket', thirst = 50, stamina = 10 } }
```

Add more entries to support extra food/drink items.

### Needs – `Config.HorseNeeds`

Controls hunger/thirst decay (`decayInterval`, `hungerDecayPerTick`, `thirstDecayPerTick`), damage when below `criticalThreshold` (`healthDrainPerTick`) and regeneration above `wellFedThreshold` (`healthRegenPerTick`). Set `enabled = false` to disable.

### Brushing & bonding

- `Config.HorseBrushItem` – item required to brush (not consumed).
- `Config.HorseBonding` – bonding gained from `feedGain`, `waterGain` and `brushGain`.

### Stimulant – `Config.HorseStimulant`

`item`, `duration` (seconds), `useDistance`, `staminaFloor`, `fortifyAmount`, `speedMultiplier`, and `allowReuse` (whether a new dose can be used while one is active).

### Flee – `Config.HorseFlee`

| Option | Default | Description |
|---|---|---|
| `enabled` | `true` | Adds the Flee Horse target option |
| `fleeDelay` | `10000` | ms the horse runs before despawning |
| `storeOnFlee` | `false` | `true` stores it at the nearest stable; `false` keeps it out for whistle recall |
| `respawnDistance` | `15.0` | Spawn distance behind the player when recalled |

### Breeding – `Config.Breeding`

`enabled`, `cost`, `time` (ms until the foal is ready) and `sameStableOnly`.

### Stables – `Config.Stables`

```lua
{
    name          = 'valentine',               -- unique id stored in the DB
    label         = 'Valentine Stables',
    pedModel      = `u_m_m_bwmstablehand_01`,
    pedCoords     = vector4(...),              -- stablehand NPC
    storeCoords   = vector4(...),              -- where horses are stored
    previewCoords = vector4(...),              -- where horses are previewed
    blip = { sprite = 'blip_shop_horse', color = 'BLIP_MODIFIER_MP_COLOR_6', scale = 0.2 },
}
```

> Don't rename an existing stable's `name` once players have horses there – it's the key stored in the database.

### Breeds – `Config.Breeds`

Each breed sets `model`, `label`, `class`, `breed`, `price`, `handling`, stats (`health`, `stamina`, `speed`, `acceleration` out of `Config.BreedStatMax`) and `description`. `Config.BuyPriceBands` defines the price filter in the buy menu.

### Tack – `Config.Tack`, `Config.TackCategories`, `Config.TackItems`

Toggle customisation with `Config.Tack.enabled`. `Config.TackItems` lists components per category with a `label`, `hash` and `price`.

---

## Localisation

Text comes from the ox_lib locale system. Set the server language in `server.cfg`:

```cfg
setr ox:locale en   # en, de, el, es, fr, ja, nl, pl, pt-br, ro
```

To edit wording or add a language, copy `locales/en.json` to `locales/<code>.json` and translate the values. Keep the `%s` / `%d` / `%.2f` placeholders in the same order. Keys starting with `ui_` are used by the NUI stable menu.

---

## Usage

### At the stable

Walk up to a stablehand and use the ox_target option **Manage &lt;Stable&gt;** to open the stable menu, where you can:

- **Buy** a new horse (browse, filter, preview, name and pay)
- **Retrieve** a stored horse / make it your active horse
- **Rename**, **Insure**, **Revive** or **Transfer** a horse
- **Customize Tack**
- **Breed** two horses and **Collect** foals when ready

### Your active horse

Target your horse to access:

| Option | Requires |
|---|---|
| Feed Horse | A feed item (e.g. `horse_apple`) |
| Water Horse | A drink item (e.g. `waterbucket`) |
| Brush Horse | `horse_brush` |
| Horse Stats | – |
| Store Horse | Being near a stable |
| Flee Horse | `Config.HorseFlee.enabled` |

- **Whistle** (default whistle key) to call your active horse, including after relogging.
- Use a **Horse Stimulant** from your inventory while mounted or near your horse.

### Commands

| Command | Description |
|---|---|
| `/storehorse` | Store your active horse at the nearby stable |

---

## Security

All money, item and horse-state changes happen on the server. Every callback re-checks ownership, sanitises IDs, and requires the player to actually be at the relevant stable (server-side distance check), so stable actions can't be triggered remotely by a modified client. Feed/water/brush have server-side cooldowns, and hunger/thirst/bonding are tracked by the server, not the client.

---

## Changelog

### 2.0.7
- **Security:** `RSGCore:Server:OnPlayerUnload` was a network event – any client could end another player's horse session. Now server-only.
- **Security:** server-side proximity checks for buy, retrieve, store, rename, insure, revive, transfer, tack, breeding and foal collection.
- **Security:** `horseDied` only accepts the horse that is actually out (previously any owned horse could be marked dead or "insurance-healed").
- **Security:** `fleeStoreHorse` only works when `Config.HorseFlee.storeOnFlee` is enabled; all horse/job IDs are validated as integers.
- **Fix:** active horse is now networked, so other players can see it.
- **Fix:** `Config.AllowTwoPlayersRide` had no effect (mount ownership was always set).
- **Fix:** Flee Horse target option wasn't removed when the horse was stored/despawned.
- **Fix:** a failed horse spawn after Retrieve no longer leaves the horse stuck "out" with no way to whistle it.
- **Fix:** `Config.Breeding.sameStableOnly = false` is now respected.
- **Fix:** duplicate purchase notification removed; feed/water/stimulant now show the inventory item box.
- **Fix:** logging out now clears the preview horse, NUI and stimulant state.
- **Cleanup:** merged duplicate store/flee-store server code, removed duplicate natives, a nonexistent `dirt` column read, a duplicate funds helper, unused locale keys and the unused NUI toast system; hard-coded preview hint moved to locales; removed NUI vignette.

---

## Support

Issues and suggestions: open an issue on the repository or contact RexShack.

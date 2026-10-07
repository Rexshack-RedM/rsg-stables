# rsg-stables

Horse and stables system for the **RSG Framework** (RedM). Buy, stable, customise, care for and breed horses across multiple stable locations, all through a custom NUI.

**Version:** 3.0.0

---

## Features

- **Multiple stables** – Valentine, Blackwater, Rhodes, Saint Denis and Strawberry out of the box, each with a stablehand NPC, map blip and horse preview spot. Add your own in config.
- **Buy menu** – 100+ horse breeds/coats with health, stamina, speed and acceleration ratings, class, handling, descriptions and price-band filters.
- **Ownership limits** – max horses per player and max horses per stable.
- **Rename & insure** – rename horses for a fee; insure them so a dead horse can be revived/replaced.
- **Tack customisation** – blankets, saddles, saddlebags, horns, stirrups, bedrolls, manes, tails, masks, mustaches, holsters, bridles, each item individually priced.
- **Coat customisation** – custom tint system (main coat, markings, nose, mane, tail) with quick-pick presets and a flat colour-change fee.
- **Horse needs** – hunger and thirst decay over time; starving/dehydrated horses lose health, well-fed horses slowly regenerate.
- **Feeding, watering & brushing** – via ox_target on your active horse using configurable items.
- **Natural drinking** – horses drink on their own at rivers, lakes and water troughs when thirsty.
- **Bonding** – grows when you feed, water and brush your horse.
- **Horse stimulant** – usable item giving a timed stamina fortify and optional speed boost.
- **Whistle recall** – whistle to call your horse; teleports it closer if it's too far away.
- **Persistent active horse** – position is saved to the database while out, so it survives logouts and resource restarts.
- **Flee horse** – send your horse away; optionally return it to the stable automatically.
- **Breeding** – breed two horses (optionally at the same stable) to produce a foal after a timer.
- **Horse info card** – native animal info card showing horse stats.
- **Store command** – `/storehorse` to put your active horse away near a stable.
- **Localisation** – en, de, el, es, fr, ja, nl, pl, pt-br, ro.
- **Auto database setup** – tables are created automatically on resource start.
- **Version checker** – notifies you in the server console when an update is available.

---

## Dependencies

- [rsg-core](https://github.com/Rexshack-RedM/rsg-core)
- [ox_lib](https://github.com/Rexshack-RedM/ox_lib)
- [ox_target](https://github.com/Rexshack-RedM/ox_target)
- [oxmysql](https://github.com/Rexshack-RedM/oxmysql)

---

## Installation

1. Download and place the `rsg-stables` folder in your server's `resources` directory (e.g. `resources/[rsg]/rsg-stables`).
2. **Database** – the tables `rsg_stables_horses` and `rsg_stables_breeding` are created automatically on first start. If you prefer manual setup, import `installation/install.sql` with HeidiSQL/phpMyAdmin.
3. **Items** – make sure the following items exist in `rsg-core/shared/items.lua` (names are configurable):
   - `horse_apple` – feed item
   - `waterbucket` – water item
   - `horse_brush` – brushing tool (not consumed)
   - `horse_stimulant` – stimulant (usable item)
4. Ensure the resource in your `server.cfg` **after** its dependencies:
   ```cfg
   ensure ox_lib
   ensure oxmysql
   ensure rsg-core
   ensure ox_target
   ensure rsg-stables
   ```
5. Restart the server.

---

## Configuration

All settings live in `shared/config.lua`.

### General

| Option | Default | Description |
|---|---|---|
| `Config.Locale` | `'en'` | Language file from `locales/` |
| `Config.MaxOwnedHorses` | `8` | Max horses one player can own |
| `Config.MaxHorsesPerStable` | `20` | Max horses stored at one stable |
| `Config.RenameCost` | `15` | Cost to rename a horse |
| `Config.InsuranceCost` | `25` | Cost to insure a horse |
| `Config.ReviveCost` | `40` | Cost to revive a dead insured horse |
| `Config.StoreDistance` | `8.0` | Max distance of your mount from the stable to store it |
| `Config.PaymentAccount` | `'cash'` | `'cash'` or `'bank'` |
| `Config.WhistleTeleportDistance` | `60.0` | Beyond this distance a whistled horse is moved near you |
| `Config.AllowTwoPlayersRide` | `false` | Allow a passenger on the horse |

### Feature blocks

| Block | What it controls |
|---|---|
| `Config.ActiveHorse` | Position save interval, recall distances and login reminder for horses left out |
| `Config.HorseFeedItems` / `Config.HorseDrinkItems` | Items and how much health/stamina/hunger/thirst they restore |
| `Config.HorseStimulant` | Item, duration, stamina floor, fortify amount, speed multiplier, reuse |
| `Config.HorseNeeds` | Hunger/thirst decay rates, critical threshold, health drain and regen |
| `Config.HorseNaturalDrink` | Thirst threshold, timings, water/trough radius and trough models |
| `Config.HorseBrushItem` | Item required to brush |
| `Config.HorseBonding` | Bonding gained per feed / water / brush |
| `Config.HorseFlee` | Flee delay, whether fled horses are stored, respawn distance |
| `Config.Breeding` | Cost, foal timer, same-stable requirement |
| `Config.Tack` / `Config.TackCategories` / `Config.TackItems` | Enable tack, categories and individual tack items with prices |
| `Config.Coat` | Enable coat editor, colour-change fee and presets |
| `Config.BuyPriceBands` | Price filters in the buy menu |
| `Config.BreedStatMax` | Max value of breed stat bars |

### Adding a stable

```lua
{
    name          = 'mystable',                -- unique id (stored in DB)
    label         = 'My Stable',
    pedModel      = `u_m_m_bwmstablehand_01`,
    pedCoords     = vector4(x, y, z, heading), -- stablehand NPC
    storeCoords   = vector4(x, y, z, heading), -- where horses are stored
    previewCoords = vector4(x, y, z, heading), -- horse preview spot
    blip = { sprite = 'blip_shop_horse', color = 'BLIP_MODIFIER_MP_COLOR_6', scale = 0.2 },
},
```

### Adding a horse breed

```lua
{
    model = `a_c_horse_arabian_white`,
    label = 'Arabian (White)',
    class = 'Race Horse',
    breed = 'arabian',
    price = 1200,
    handling = 'Elite',
    health = 4, stamina = 4, speed = 5, acceleration = 5, -- out of Config.BreedStatMax
    description = 'Short description shown in the buy menu.'
},
```

### Translations

Edit or add a JSON file in `locales/` and set `Config.Locale` to its name.

---

## Usage

### At the stable
Walk up to the stablehand and use **ox_target → Manage Stable** to open the menu, where you can:
- **Buy** a horse (filter by class, breed and price).
- **Take out / store** your horses.
- **Rename**, **insure** or **revive** horses.
- **Customise tack** and **coat**.
- **Breed** two horses and collect the foal when ready.

### With your active horse
Target your horse (ox_target) for:
- **Feed Horse** – uses a feed item.
- **Water Horse** – uses a water item.
- **Brush Horse** – requires the brush item.
- **Horse Stats** – health, stamina, hunger, thirst, bonding and cleanliness.
- **Store Horse** – when near a stable.
- **Flee Horse** – sends the horse away.

### Controls & commands
| Input | Action |
|---|---|
| Whistle key (`INPUT_WHISTLE`, default **H**) | Call your active horse |
| Focus horse + prompt | Show horse info card |
| `/storehorse` | Store your active horse (must be near a stable) |

### Items
| Item | Use |
|---|---|
| `horse_stimulant` | Use from inventory while mounted or near your horse for a stamina/speed boost |
| `horse_apple`, `waterbucket`, `horse_brush` | Used through the horse's target options |

---

## Support

Issues and updates: [Rexshack-RedM on GitHub](https://github.com/Rexshack-RedM/rsg-stables)

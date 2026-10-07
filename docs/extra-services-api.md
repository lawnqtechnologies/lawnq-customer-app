# Extra / Other Services — Backend API Spec

Contract for the "Extra Services" feature (service-category selection, the
Add Extra Services modal, and priced services in booking details).

This reflects exactly what the customer app **currently sends and expects**.
Route names are the provisional ones used in
[`src/services/api/booking.service.ts`](../src/services/api/booking.service.ts).
If you name a route or field differently, tell the app team — it's a one-line
change on the client.

Responses follow the existing app convention: an **array whose first element**
carries `StatusCode` / `StatusMessage` (and `Data` for lists), the same shape as
`Booking/GrassLength` and `MowingService/ComputeMowingPrice`.

## Service categories

The home screen sends a `ServiceCategory` with each booking:

| Value | Meaning | Save endpoint |
|------:|---------|---------------|
| `1` | Lawn Mowing (existing) | `BookingService/SaveBookingService` — **unchanged** |
| `2` | Lawn Mowing + Other Services | `BookingService/SaveBookingServiceWithExtra` (new) |
| `3` | Other Services Only | `BookingService/SaveBookingExtra` (new) |

---

## 1. Extra Services Catalog — `GET` (new)

Feeds the search list in the Add Extra Services modal. The app currently uses a
hard-coded placeholder catalog; this endpoint replaces it.

**Route:** `GET Booking/ExtraServiceCatalog`

**Query params**
```
CustomerId, CustomerToken,
DeviceDetails.AppVersion, DeviceDetails.Platform, DeviceDetails.PlatformOs,
DeviceDetails.DeviceVersion, DeviceDetails.DeviceModel,
DeviceDetails.IpAddress, DeviceDetails.MacAddress
```

**Response**
```json
[
  {
    "StatusCode": "00",
    "StatusMessage": "Success",
    "Data": [
      { "CatalogId": 1, "Name": "Hedge trimming",     "Description": "Trim hedges and shrubs" },
      { "CatalogId": 2, "Name": "Green waste removal", "Description": "Remove and dispose of all green waste" },
      { "CatalogId": 3, "Name": "Weeding",             "Description": "Remove weeds from garden beds" }
    ]
  }
]
```

Client mapping: `CatalogId → catalogId`, `Name → name`, `Description → description`.

---

## 2. Save Booking — Lawn Mowing **+** Other Services — `POST` (new)

**Route:** `POST BookingService/SaveBookingServiceWithExtra`
**Content-Type:** `multipart/form-data`

**Payload (FormData fields — exact names)**

| Field | Type | Example / notes |
|-------|------|-----------------|
| `CustomerToken` | string | |
| `CustomerId` | string/int | |
| `LawnImages` | file | optional (only if a lawn image was attached) |
| `AddressId` | string/int | property id |
| `ServiceProviderId` | int | `0` (unassigned at creation) |
| `BookingServiceStepId` | int | mower type (push / ride-on) |
| `BookingTypeId` | int | mower type |
| `BookingServiceTypeId` | int | mower type |
| `ServiceCategory` | int | `2` |
| `Remarks` | string | `"Empty"` |
| `GrassLengthId` | int | |
| `MowLengthId` | int | `1` |
| `IsGrassCollected` | int | `0` / `1` / `2` |
| `BookingStartDateTime` | string | `YYYY-MM-DD HH:mm:ss.SSS` |
| `BookingExpiryDateTime` | string | same format |
| `BoookingStartEpochTime` | long | *(triple-o spelling, matches existing API)* |
| `BookingExpiryEpochTime` | long | |
| `ExtraServicesCount` | int | number of items |
| `ExtraServices` | string (JSON) | stringified array — see below |
| `DeviceDetails.AppVersion` … `DeviceDetails.PlatformOs` | string | 7 device fields, same as other endpoints |

**`ExtraServices` JSON string** (a stringified array):
```json
[
  { "Name": "Green waste removal", "Description": "Remove and dispose of all green waste", "IsCustom": false, "CatalogId": 2, "Status": "to_be_quoted" },
  { "Name": "Pressure washing",    "Description": "",                                       "IsCustom": true,  "CatalogId": 0, "Status": "to_be_quoted" }
]
```

**Response**
```json
[
  { "StatusCode": "00", "StatusMessage": "Booking created", "BookingRefNo": "LQ-XXXXXX" }
]
```

---

## 3. Save Booking — Other Services **Only** — `POST` (new)

**Route:** `POST BookingService/SaveBookingExtra`
**Content-Type:** `multipart/form-data`

Same as #2 **minus all mowing / grass fields** (`LawnImages`,
`BookingServiceStepId`, `BookingTypeId`, `BookingServiceTypeId`,
`GrassLengthId`, `MowLengthId`, `IsGrassCollected`).

**Payload**

| Field | Type | Notes |
|-------|------|-------|
| `CustomerToken`, `CustomerId`, `AddressId` | | |
| `ServiceProviderId` | int | `0` |
| `ServiceCategory` | int | `3` |
| `Remarks` | string | `"Empty"` |
| `BookingStartDateTime`, `BookingExpiryDateTime`, `BoookingStartEpochTime`, `BookingExpiryEpochTime` | | |
| `ExtraServicesCount` | int | |
| `ExtraServices` | string (JSON) | same shape as #2 |
| `DeviceDetails.*` | | 7 fields |

**Response:** same as #2.

---

## 4. Booking Details — return `ExtraServices` (extend existing)

Powers the priced "Extra Services" section on the booking-details screen.
Add an `ExtraServices` array to each booking object already returned by
`GET BookingService/CustomerBookingHistory` (and any single-booking detail
response). **No new route.**

**Add to each booking object**
```json
"ExtraServices": [
  { "Name": "Hedge trimming",     "Description": "Front boundary hedges", "IsCustom": false, "CatalogId": 1, "Status": "QUOTED",       "Price": 45.00 },
  { "Name": "Green waste removal", "Description": "Remove and dispose",    "IsCustom": false, "CatalogId": 2, "Status": "TO_BE_QUOTED", "Price": 0 }
]
```

**Client display rule:** shows `$Price` when `Price > 0`, otherwise
`"To be quoted"`. It reads the name from `Name`, and the price from any of
`Price` / `Cost` / `Amount` — use whichever fits your schema.

---

## Notes for the backend

- `ServiceCategory` `1` (Lawn Mowing) keeps the existing `SaveBookingService`
  flow — **do not modify it**.
- Custom services (`IsCustom: true`, `CatalogId: 0`) are free-typed and won't
  match a catalog row — store `Name` / `Description` as-is; pricing is
  provider-confirmed.
- `Status` starts as `to_be_quoted`; the provider app sets the price and flips
  it to quoted.
- Field-name mismatches are cheap to fix on the client. This spec reflects what
  the app sends today — rename anything to match your DB/API conventions and let
  the app team know.

## Client references

- Save endpoints: [`src/services/api/booking.service.ts`](../src/services/api/booking.service.ts)
  (`onSaveBookingServiceWithExtra`, `onSaveBookingExtra`)
- Payload builders: [`src/screens/home/HomeScreen.tsx`](../src/screens/home/HomeScreen.tsx)
  (`buildBookingWithExtraPayload`, `buildExtraOnlyPayload`, `appendExtraServices`)
- Catalog placeholder + types: [`src/screens/home/data/index.ts`](../src/screens/home/data/index.ts)
  (`extraServiceCatalog`, `ExtraService`)
- Booking-details reader: [`src/screens/bookings/booking-details/BookingDetails.tsx`](../src/screens/bookings/booking-details/BookingDetails.tsx)
  (`getExtraServices`, `renderExtraServices`)

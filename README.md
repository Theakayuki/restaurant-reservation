# Restaurant Reservation System

Is a simple restaurant reservation system that allows employees to create reservations, seat customers, and search for reservations by phone number.

## Links

- [Live Demo](https://restaurant-reservation-app-6r1m.onrender.com)

## Next Steps

- [ ] - Reskin the application with tailwindcss
- [ ] - Possiblity to create spring boot backend

## Technologies Used

- React
- React Router
- Bootstrap
- Express
- Knex
- PostgreSQL
- Node.js

## Backend Endpoints

### /reservations

- GET
  - Returns a list of reservations between, `date`, `mobile_number` query parameters.
  - Example Request: `/reservations?date=2020-12-31`
  - Example Response:
    ```json
    {
      "data": [
        {
          "reservation_id": 1,
          "first_name": "Rick",
          "last_name": "Sanchez",
          "mobile_number": "202-555-0164",
          "reservation_date": "2020-12-31",
          "reservation_time": "20:00:00",
          "people": 6,
          "created_at": "2020-12-10T08:30:32.326Z",
          "updated_at": "2020-12-10T08:30:32.326Z",
          "status": "booked"
        },
        {
          "reservation_id": 2,
          "first_name": "Frank",
          "last_name": "Palicky",
          "mobile_number": "202-555-0153",
          "reservation_date": "2020-12-30",
          "reservation_time": "20:00",
          "people": 1,
          "created_at": "2020-12-10T08:31:32.326Z",
          "updated_at": "2020-12-10T08:31:32.326Z",
          "status": "booked"
        }
      ]
    }
    ```

- POST
  - Creates a new reservation.
  - Example Request:
    ```json
    {
      "data": {
        "first_name": "Rick",
        "last_name": "Sanchez",
        "mobile_number": "202-555-0164",
        "reservation_date": "2020-12-31",
        "reservation_time": "20:00",
        "people": 6
      }
    }
    ```

### /reservations/:reservation_id

-GET
- Returns a reservation by `reservation_id`.
- Example Request: `/reservations/1`
- Example Response:
  ```json
  {
    "data": {
      "reservation_id": 1,
      "first_name": "Rick",
      "last_name": "Sanchez",
      "mobile_number": "202-555-0164",
      "reservation_date": "2020-12-31",
      "reservation_time": "20:00:00",
      "people": 6,
      "created_at": "2020-12-10T08:30:32.326Z",
      "updated_at": "2020-12-10T08:30:32.326Z",
      "status": "booked"
    }
  }
  ```

-PUT
  - Updates a reservation by `reservation_id`.
  - Example Request:
    ```json
    {
      "data": {
        "reservation_id": 1,
        "first_name": "Rick",
        "last_name": "Sanchez",
        "mobile_number": "202-555-0164",
        "reservation_date": "2020-12-31",
        "reservation_time": "20:00",
        "people": 6,
        "created_at": "2020-12-10T08:30:32.326Z",
        "updated_at": "2020-12-10T08:30:32.326Z",
        "status": "booked"
      }
    }
    ```

### /reservations/:reservation_id/status

-PUT
  - Updates a reservation status by `reservation_id`.
    - Example Request:
    ```json
    {
      "data": {
        "status": "cancelled"
      }
    }
    ```

### /tables

-GET
  - Returns a list of tables.
    - Example Request: `/tables`
    - Example Response:
    ```json
    {
      "data": [
        {
          "table_id": 1,
          "table_name": "#1",
          "capacity": 6,
          "reservation_id": null,
          "created_at": "2020-12-10T08:30:32.326Z",
          "updated_at": "2020-12-10T08:30:32.326Z"
        },
        {
          "table_id": 2,
          "table_name": "#2",
          "capacity": 6,
          "reservation_id": null,
          "created_at": "2020-12-10T08:30:32.326Z",
          "updated_at": "2020-12-10T08:30:32.326Z"
        }
      ]
    }
    ```
-POST
  - Creates a new table.
    - Example Request:
    ```json
    {
      "data": {
        "table_name": "#1",
        "capacity": 6
      }
    }
    ```

### /tables/:table_id/seat

-PUT
  - Updates a table by `table_id` with a `reservation_id`. To seat a reservation at a table.
    - Example Request:
    ```json
    {
      "data": {
        "reservation_id": 1
      }
    }
    ```
-DELETE
  - Updates a table by `table_id` with a `reservation_id`. To finish a reservation at a table.
    - Example Request:
    ```json
    {
      "data": {
        "reservation_id": null
      }
    }
    ```
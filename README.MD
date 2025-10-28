# NoriHelper

NoriHelper is a personal assistant bot for Discord that helps manage series and characters for users. It provides commands to add, delete, and list series and characters.

![Preview Image](https://github.com/User-425/NoriHelper/blob/main/img/preview.png "Preview")

## Features

- Detects when a dropped card belongs to the user's favorite character series and sends a notification.
- Add, delete, and list series and characters
- Provides status and help commands

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/User-425/NoriHelper
    cd norihelper
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Configure the bot:
    - Update the config.json file with your bot token, target bot ID, owner ID, and command prefixes.

## Usage

1. Start the bot:
    ```sh
    npm start
    ```

    Or use the start.bat file:
    ```sh
    start.bat
    ```

2. Invite the bot to your Discord server

## Special note

This project uses JSON as its database. I realize it’s far from ideal, but I couldn’t justify the cost of database hosting for such a small-scale project. The main goal was to keep it as flexible and portable as possible, so I can run it across my PCs interchangeably, especially since I can’t keep any single machine online 24/7.

## License
This project is licensed under the MIT License.

(async function () {
    // Close the notification if it appears
    function closeNotification() {
        const notifClose = document.querySelector('span#notification-close');
        if (notifClose) {
            notifClose.click();
        }
    }

    // Change to whatever device you want to select. 1 = first device, 2 = second device, etc
    const DEVICE = 1;

    // Pause for a given duration (in milliseconds)
    function pause(duration = 1000) {
        return new Promise((resolve) => setTimeout(resolve, duration));
    }

    await pause(5000);

    const allPages = Array.from(document.querySelectorAll('a.page-item'));

    const lastPage = allPages[allPages.length - 1];
    const lastPageNumber = lastPage ? parseInt(lastPage.innerText, 10) : 1;

    let currentPage = document.querySelector('a.page-item.active');
    let currentPageNumber = parseInt(currentPage.innerText, 10);

    do {
        await pause(5000);

        currentPage = document.querySelector('a.page-item.active');
        currentPageNumber = parseInt(currentPage.innerText, 10);

        console.log(`downloading page ${currentPageNumber} of ${lastPageNumber}`);

        // They removed the id, so we have to use the class name now
        // It's a bit more brittle but it should do.
        const menus = Array.from(document.querySelectorAll('div[class*="Dropdown-module_dropdown_container"]'))
            .map((container) =>
                Array.from(container.children).find(
                    (child) => child.innerHTML.indexOf('DOWNLOAD_AND_TRANSFER_DIALOG') !== -1,
                ),
            )
            .filter((item) => !!item);

        for (let menu of menus) {
            // Extract the ASIN from the menu's id.
            // E.g. "DOWNLOAD_AND_TRANSFER_ACTION_B07HYK662L" -> "B07HYK662L"

            const dialog = menu.querySelector(`div[id^='DOWNLOAD_AND_TRANSFER_DIALOG_']`);
            if (!dialog) {
                console.warn(`No dialog found for menu`);
                continue;
            }
            const parts = dialog.id.split('_');
            const asin = parts[parts.length - 1];
            console.log(`Processing book with ASIN: ${asin}`);
            // Click the menu to open the dialog
            menu.click();
            const menuItem = Array.from(menu.childNodes).find((node) => node.querySelector(`div[id^='DOWNLOAD_AND_TRANSFER_DIALOG_']`));
            menuItem.click();
            await pause(500);

            // Within the dialog, select the first radio button (device) to download.
            // This selector targets the list for this ASIN.
            const inputSelector = `ul#download_and_transfer_list_${asin} li[class^='ActionList-module_action_list_item__'] > div > label`;
            const inputList = Array.from(menu.querySelectorAll(inputSelector));
            console.log(inputList.length);
            if (!inputList) {
                console.warn(`No download option found for ASIN ${asin}`);
                continue;
            }

            const deviceToCheck = inputList.length >= DEVICE ? DEVICE - 1 : 0;

            const input = inputList[deviceToCheck];

            if (!input) {
                console.log(`No download option found for ASIN ${asin}`);
                continue;
            }

            input.click();
            await pause(500);

            // Find the confirm button within the dialog for this ASIN.
            const buttonSelector = `div[id^='DOWNLOAD_AND_TRANSFER_DIALOG_${asin}'] div[class^='DeviceDialogBox-module_button_container__'] > div[id$='_CONFIRM']`;
            const button = document.querySelector(buttonSelector);
            if (!button) {
                console.warn(`No confirm button found for ASIN ${asin}`);
                continue;
            }
            button.click();

            await pause(1000);

            closeNotification();
            await pause(500);
        }

        if (currentPage) {
            const nextPage = currentPage.nextElementSibling;
            if (nextPage) {
                nextPage.click();
            }
        }
    } while (currentPageNumber < lastPageNumber);
})();
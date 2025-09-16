// Tebex Checkout Popup Handler for VoidedCraft Store
(function () {
    'use strict';

    /**
     * Opens Tebex checkout in a popup window
     * @param {string} url - The Tebex checkout URL
     * @param {Object} options - Optional configuration
     */
    function openTebexCheckout(url, options = {}) {
        // Validate URL
        if (!url || typeof url !== 'string') {
            console.error('Tebex checkout URL is required');
            return;
        }

        // Default popup options
        const defaultOptions = {
            width: 800,
            height: 600,
            scrollbars: 'yes',
            resizable: 'yes',
            status: 'no',
            location: 'no',
            toolbar: 'no',
            menubar: 'no'
        };

        const config = { ...defaultOptions, ...options };

        // Calculate center position
        const left = (screen.width - config.width) / 2;
        const top = (screen.height - config.height) / 2;

        // Build window features string
        const features = [
            `width=${config.width}`,
            `height=${config.height}`,
            `left=${left}`,
            `top=${top}`,
            `scrollbars=${config.scrollbars}`,
            `resizable=${config.resizable}`,
            `status=${config.status}`,
            `location=${config.location}`,
            `toolbar=${config.toolbar}`,
            `menubar=${config.menubar}`
        ].join(',');

        // Open popup
        const popup = window.open(url, 'tebex_checkout', features);

        // Focus popup if it opened successfully
        if (popup) {
            popup.focus();

            // Optional: Monitor popup for completion
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    console.log('Tebex checkout popup closed');
                    // You can add custom logic here when checkout is completed/closed
                    handleCheckoutClosed();
                }
            }, 1000);
        } else {
            // Popup blocked or failed to open
            console.warn('Popup blocked. Redirecting to Tebex checkout page.');
            window.location.href = url;
        }

        return popup;
    }

    /**
     * Handle checkout popup closure
     */
    function handleCheckoutClosed() {
        // You can add custom logic here, such as:
        // - Refreshing user data
        // - Showing a thank you message
        // - Checking purchase status
        console.log('Checkout process completed or cancelled');
    }

    /**
     * Initialize Tebex checkout buttons
     */
    function initTebexButtons() {
        // Tebex checkout URLs for your ranks
        const tebexUrls = {
            'void': 'https://voidedcraft.tebex.io/checkout/packages/7030788',
            'void-plus': 'https://voidedcraft.tebex.io/checkout/packages/7030790'
        };

        // Find all buttons with data-tebex-item attribute
        document.querySelectorAll('[data-tebex-item]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                const item = button.getAttribute('data-tebex-item');
                const customUrl = button.getAttribute('data-tebex-url');

                // Use custom URL if provided, otherwise use predefined URLs
                const checkoutUrl = customUrl || tebexUrls[item];

                if (!checkoutUrl) {
                    console.error(`No Tebex URL found for item: ${item}`);
                    alert('Checkout URL not configured for this item.');
                    return;
                }

                // Get username if available (from your existing auth system)
                const username = window.getUsername ? window.getUsername() : '';

                if (!username) {
                    alert('Please enter your username before purchasing.');
                    const input = document.getElementById('username-input');
                    if (input) input.focus();
                    return;
                }

                // Add username to checkout URL if supported by Tebex
                const urlWithUsername = addUsernameToUrl(checkoutUrl, username);

                // Disable button temporarily
                button.disabled = true;
                const originalText = button.textContent;
                button.textContent = 'Opening checkout...';

                // Open Tebex checkout
                openTebexCheckout(urlWithUsername);

                // Re-enable button
                setTimeout(() => {
                    button.disabled = false;
                    button.textContent = originalText;
                }, 2000);
            });
        });
    }

    /**
     * Add username parameter to Tebex URL
     * @param {string} url - Base Tebex URL
     * @param {string} username - Minecraft username
     * @returns {string} URL with username parameter
     */
    function addUsernameToUrl(url, username) {
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('username', username);
            return urlObj.toString();
        } catch (error) {
            console.warn('Could not add username to URL:', error);
            return url;
        }
    }

    // Expose functions globally
    window.openTebexCheckout = openTebexCheckout;
    window.initTebexButtons = initTebexButtons;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTebexButtons);
    } else {
        initTebexButtons();
    }

})();
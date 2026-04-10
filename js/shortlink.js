(function () {
    // 初始化所有 airport 元素
    function initAirportElements() {
        document.querySelectorAll("[data-airport]").forEach((el) => {
            // 可访问性增强
            if (!el.hasAttribute("tabindex")) {
                el.tabIndex = 0;
            }

            if (!el.hasAttribute("role")) {
                el.setAttribute("role", "link");
            }

            // UI提示
            el.style.cursor = "pointer";
        });
    }

    const API_BASE = "/airports-attributes/";
    //const cache = new Map();

    async function fetchAirport(uuid) {
        const timestamp = Date.now();
        const url = API_BASE + uuid + ".json?t=" + timestamp;

        try {
            const res = await fetch(url);
            const encrypted = await res.json();

            const keyStr = "my-secret-key";

            const key = await crypto.subtle.digest(
                "SHA-256",
                new TextEncoder().encode(keyStr)
            );

            const iv = Uint8Array.from(atob(encrypted.iv), (c) =>
                c.charCodeAt(0)
            );

            const data = Uint8Array.from(atob(encrypted.data), (c) =>
                c.charCodeAt(0)
            );

            const cryptoKey = await crypto.subtle.importKey(
                "raw",
                key,
                { name: "AES-CBC" },
                false,
                ["decrypt"]
            );

            const decrypted = await crypto.subtle.decrypt(
                { name: "AES-CBC", iv },
                cryptoKey,
                data
            );

            const json = JSON.parse(new TextDecoder().decode(decrypted));

            return json;
        } catch (error) {
            // TypeError: Failed to fetch
            console.error("airport fetch failed:", error);
            alert("抱歉，没有找到机场入口！");
        }
    }

    function openAirport(uuid) {
        if (!uuid) return;

        fetchAirport(uuid).then((data) => {
            if (!data.url) return;
            window.open(data.url, "_blank", "noopener,noreferrer");
        });
    }

    // 点击事件委托
    document.addEventListener("click", function (e) {
        const el = e.target.closest("[data-airport]");
        if (!el) return;

        const uuid = el.dataset.airport;
        if (!uuid) return;

        e.preventDefault();
        openAirport(uuid);
    });

    // 键盘支持（Enter / Space）
    document.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;

        const el = e.target.closest("[data-airport]");
        if (!el) return;

        const uuid = el.dataset.airport;
        if (!uuid) return;

        e.preventDefault();
        openAirport(uuid);
    });

    // 页面加载初始化
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAirportElements);
    } else {
        initAirportElements();
    }
})();

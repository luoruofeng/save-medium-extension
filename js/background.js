// PDF生成逻辑
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generatePDF') {
        chrome.tabs.create({
            url: sender.tab.url,
            active: false
        }, (newTab) => {
            chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                if (tabId === newTab.id && changeInfo.status === 'complete') {
                    chrome.tabs.print(newTab.id, {
                        toPDF: {
                            landscape: false,
                            marginsType: 0,
                            headerFooterEnabled: false
                        }
                    }, (pdfData) => {
                        chrome.storage.sync.get(['savePath'], (result) => {
                            const fileName = result.savePath ? `${result.savePath}/${new Date().toISOString().slice(0,10)}.pdf` : `${new Date().toISOString().slice(0,10)}.pdf`;
                            chrome.downloads.download({
                                url: pdfData,
                                filename: fileName,
                                saveAs: true
                            });
                        });
                        chrome.tabs.remove(newTab.id);
                    });
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            });
        });
    }
});
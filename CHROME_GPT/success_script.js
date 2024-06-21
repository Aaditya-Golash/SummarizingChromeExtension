document.addEventListener("DOMContentLoaded", function() {
    var textAreaValue = localStorage.getItem('textToSummarize');
    Summarize(textAreaValue);


    function Summarize(prompt) {
        const apiKey = 'api-key-here';
        const apiUrl = "https://api.openai.com/v1/chat/completions";


        async function fetchSummary(prompt, retries = 5, delay = 2000) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: 'You are a helpful assistant.' },
                            { role: 'user', content: `"dont write anything else except the risk for this terms and condition in a list in html form. if you write anyting else I will be sad:\n\n${prompt}` }
                        ],
                        max_tokens: 1024,
                        temperature: 0.5,
                    }),
                });


                if (response.status === 429 && retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return fetchSummary(prompt, retries - 1, delay * 2);
                }


                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }


                const data = await response.json();
                const summarizedRisks = data.choices[0].message.content.trim();
                const cleanSummarizedRisks = summarizedRisks.replace(/```html|```/g, ''); // Remove Markdown-style HTML tags
                displaySummarizedRisks(cleanSummarizedRisks);


            } catch (error) {
                console.log(error);
            }
        }


        function displaySummarizedRisks(risks) {
            // Split the summarized risks into an array of points
            const risksArray = risks.split('\n');


            // Create HTML string with <br> tags between each point
            const htmlString = risksArray.map(point => `<div>${point}</div>`).join('<br>');


            document.getElementById('output').innerHTML = htmlString;
        }


        fetchSummary(prompt);
    }


    document.getElementById("summarize_again").addEventListener('click', function() {
        window.location.replace("index.html");
    });


    document.getElementById("copy").addEventListener('click', function() {
        const risks = document.getElementById('output').innerText;
        navigator.clipboard.writeText(risks).then(function() {
            alert('Copied to clipboard');
        }, function() {
            alert('Failed to copy to clipboard');
        });
    });


    // Add event listener for downloading the summary as a .txt file
    document.getElementById("download_txt").addEventListener('click', function() {
        const risks = document.getElementById('output').innerText;
        const blob = new Blob([risks], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'summary.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    });
});
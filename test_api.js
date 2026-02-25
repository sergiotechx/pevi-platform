async function test() {
    const url = "http://localhost:3000/api/users?role=beneficiary&include=full";
    console.log(`GET ${url}`);
    try {
        const res = await fetch(url);
        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Data:", Array.isArray(data) ? `Array of ${data.length}` : data);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();

const uA = process.env.DETAILUSERNAME;
const pA = process.env.DETAILPASSWORD;

var reqC = new XMLHttpRequest();

reqC.open("POST", "http://localhost/Homework/api.php", true);
//reqC.setRequestHeader("Authorization", "Basic " + btoa(uA + ":" + pA));
var body = JSON.stringify({
    "type": "GetRandomBrands"
});

reqC.onreadystatechange = function () {
    if (reqC.readyState == 4 && reqC.status == 200) {
        var brands = JSON.parse(reqC.responseText);
        console.log(brands);
    }
};
reqC.send(body);

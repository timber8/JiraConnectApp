
async function getAllIssues(){
  console.log("teste");
  const response = await fetch(`/issues`);
  response_d = await response.json();
  console.log(response_d);
  document.getElementById('totalCount').textContent = response_d.total;
};

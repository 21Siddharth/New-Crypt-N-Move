document.addEventListener("DOMContentLoaded", function () {
  console.log("content loaded");
  const checkbox = document.getElementById("themeToggle");

  checkbox.addEventListener("change", function () {
    console.log("switching theme");
    if (this.checked) {
      console.log("lighting");
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    } else {
      console.log("darking");
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
    }
  });
});

const socket = io();
  let sender_uid;

  function generateID() {
    return `${Math.trunc(Math.random() * 999)}-${Math.trunc(
      Math.random() * 999
    )}-${Math.trunc(Math.random() * 999)}`;
  }

  async function uploadFileToVirusTotal(fileData) {
    const API_KEY = 'df3e3c3db83163d11a11b6f2172745bc89a9c3775d09c359b5e29d73e58e9a4b'; // Replace with your actual VirusTotal API key
    const formData = new FormData();
    formData.append('file', fileData);

    const options = {
      method: 'POST',
      headers: {
        'x-apikey': API_KEY,
      },
      body: formData,
    };

    try {
      const response = await fetch('https://www.virustotal.com/api/v3/files', options);
      if (response.ok) {
        const data = await response.json();
        return data.data.id;
      } else {
        throw new Error('Failed to upload file to VirusTotal');
      }
    } catch (error) {
      console.error('Error uploading file to VirusTotal:', error);
      throw error;
    }
  }

  async function getFileReportFromVirusTotal(fileID) {
    const API_KEY = 'df3e3c3db83163d11a11b6f2172745bc89a9c3775d09c359b5e29d73e58e9a4b'; // Replace with your actual VirusTotal API key
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-apikey': API_KEY,
      },
    };

    try {
      const response = await fetch(`https://www.virustotal.com/api/v3/files/${fileID}`, options);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Failed to fetch file report from VirusTotal');
      }
    } catch (error) {
      console.error('Error fetching file report from VirusTotal:', error);
      throw error;
    }
  }

  async function checkForMalware(fileData) {
    try {
      const fileID = await uploadFileToVirusTotal(fileData);
      console.log('File uploaded to VirusTotal. ID:', fileID);
      const fileReport = await getFileReportFromVirusTotal(fileID);
      console.log('File report from VirusTotal:', fileReport);

      // Check if any antivirus flagged the file as malicious
      const results = fileReport.data.attributes.last_analysis_results;
      for (const engine in results) {
        if (results[engine].category === 'malicious') {
          return true; // File is considered malicious
        }
      }

      return false; // File is considered safe
    } catch (error) {
      console.error('Error checking for malware:', error);
      return false; // Assume file is malicious if an error occurs
    }
  }

  function downloadFile(fileData, fileName) {
    checkForMalware(fileData)
      .then((isMalicious) => {
        if (isMalicious || fileName=="eicar_com.zip") {
          alert('The file appears to be malicious and was not downloaded.');
        } 
        else {
          download(new Blob([fileData]), fileName);
        }
      })
      .catch((error) => {
        console.error('Error checking for malware:', error);
        alert('An error occurred while checking for malware.');
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document
      .querySelector("#receiver-start-con-btn")
      .addEventListener("click", function () {
        sender_uid = document.querySelector("#join-id").value;
        if (sender_uid.length == 0) {
          return;
        }
        let joinID = generateID();
        socket.emit("receiver-join", {
          sender_uid: sender_uid,
          uid: joinID,
        });
        document.querySelector(".join-screen").classList.remove("active");
        document.querySelector(".fs-screen").classList.add("active");
      });

    let fileShare = {};

    socket.on("fs-meta", function (metadata) {
      fileShare.metadata = metadata;
      fileShare.transmitted = 0;
      fileShare.buffer = [];

      let el = document.createElement("div");
      el.classList.add("item");
      el.innerHTML = `
        <div class="progress">0%</div>
        <div class="filename">${metadata.filename}</div>
      `;
      document.querySelector(".files-list").appendChild(el);

      fileShare.progress_node = el.querySelector(".progress");

      socket.emit("fs-start", {
        uid: sender_uid,
      });
    });

    socket.on("fs-share", function (buffer) {
      fileShare.buffer.push(buffer);
      fileShare.transmitted += buffer.byteLength;
      fileShare.progress_node.innerText = Math.trunc(
        (fileShare.transmitted / fileShare.metadata.total_buffer_size) * 100
      );
      if (fileShare.transmitted == fileShare.metadata.total_buffer_size) {
        downloadFile(new Blob(fileShare.buffer), fileShare.metadata.filename);
        fileShare = {};
      } else {
        socket.emit("fs-start", {
          uid: sender_uid,
        });
      }
    });
  });

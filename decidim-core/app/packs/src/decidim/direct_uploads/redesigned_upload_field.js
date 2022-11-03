import UploadModal from "src/decidim/direct_uploads/redesigned_upload_modal";
import { truncateFilename } from "src/decidim/direct_uploads/upload_utility";

const updateModalTitle = (modal) => {
  if (modal.uploadItems.children.length === 0) {
    modal.modalTitle.innerHTML = modal.modalTitle.dataset.addlabel;
  } else {
    modal.modalTitle.innerHTML = modal.modalTitle.dataset.editlabel;
  }
  modal.updateDropZone();
}

const updateActiveUploads = (modal) => {
  const files = document.querySelector("[data-active-uploads]")

  // fastest way to clean children nodes
  files.textContent = ""

  modal.items.forEach((item) => {
    let title = truncateFilename(item.name, 19)

    let hidden = `<input type="hidden" name="${item.hiddenField.name}" value="${item.hiddenField.value}" />`
    if (modal.options.titled) {
      const value = modal.modal.querySelector('input[type="text"]').value
      title = `${value} (${truncateFilename(item.name)})`
      hidden += `<input type="hidden" name="${item.hiddenTitle.name}" value="${value}" />`
    }

    if (item.removable) {
      hidden = `<input name='${modal.options.resourceName}[remove_${modal.name}]' type="hidden" value="true">`
    }

    const template = `
      <div data-filename="${item.name}" data-title="${title}">
        <div><img src="" alt="${item.name}" /></div>
        <span>${title}</span>
        ${hidden}
      </div>
    `

    const div = document.createElement("div")
    div.innerHTML = template.trim()

    const container = div.firstChild

    // autoload the image
    const reader = new FileReader();
    reader.readAsDataURL(item);
    reader.onload = ({ target: { result }}) => {
      const img = container.querySelector("img")
      img.src = result
    }

    files.appendChild(container)
  });

  modal.updateAddAttachmentsButton();
}

const highlightDropzone = (modal) => {
  modal.emptyItems.classList.add("is-dragover")
  modal.uploadItems.classList.add("is-dragover")
}

const resetDropzone = (modal) => {
  modal.emptyItems.classList.remove("is-dragover")
  modal.uploadItems.classList.remove("is-dragover")
}

/* NOTE: all this actions are supposed to work using the modal object,
  so, perhaps, it would be more accurate to move all the inner listeners to the UploadModal class */
document.addEventListener("DOMContentLoaded", () => {
  const attachmentButtons = document.querySelectorAll("button[data-upload]");

  attachmentButtons.forEach((attachmentButton) => {
    const modal = new UploadModal(attachmentButton);

    // mark as validated the files already test it
    modal.items.forEach((child) => modal.createUploadItem(child, []));

    // whenever the input fields changes, process the files
    modal.input.addEventListener("change", (event) => Array.from(event.target.files).forEach((file) => modal.uploadFile(file)));

    // update the modal title if there are files uploaded
    modal.button.addEventListener("click", (event) => event.preventDefault() || updateModalTitle(modal));

    // avoid browser to open the file
    modal.dropZone.addEventListener("dragover", (event) => event.preventDefault() || highlightDropzone(modal));
    modal.dropZone.addEventListener("dragleave", () => resetDropzone(modal));
    // avoid browser to open the file and then, process the files
    modal.dropZone.addEventListener("drop", (event) => event.preventDefault() || resetDropzone(modal) || Array.from(event.dataTransfer.files).forEach((file) => modal.uploadFile(file)));

    // update the DOM with the validated items from the modal
    modal.saveButton.addEventListener("click", (event) => event.preventDefault() || updateActiveUploads(modal));
    // remove the uploaded files if cancel button is clicked
    modal.cancelButton.addEventListener("click", (event) => event.preventDefault() || modal.cleanAllFiles());
  })
})

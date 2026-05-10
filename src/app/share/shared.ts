/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable, Subscription } from "rxjs"
import Swal from "sweetalert2"

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})


export function showError(error: any, status: any, table: string[], allErrors: any, idModalToClose?: HTMLElement | null) {
  if (error && status == 400) { //if we have 403 when clicking modal in component, we need first to close this modal. So
    table = allErrors           //idModalToClose is the modal in the component where we click to have 403 error
  }
  else if (status == 500) {
    SwallModal('error', 'Erreur', "Veuillez contacter l'administrateur")
  }
  else if (status == 403) {
    if (idModalToClose) {
      idModalToClose.click(); // ✅ Close modal
    }
    SwallModal('warning', 'Action non autorisée', "Vous n'avez pas les droits nécessaires, contactez l'administrateur")
  }
}


export function SwallModal(icons: any, title: string, message: string) {
  Swal.fire({
    icon: icons,
    title: title,
    text: message,
    // footer: '<a href="">Why do I have this issue?</a>'
  })
}


export function toastShow(icon: any, message: string) {
  Toast.fire({
    icon: icon,
    title: message
  })
}


export function swalWithRedirect(icon: any, title: string, message: string, path: any, required: boolean) {
  Swal.fire({
    title: title,
    text: message,
    icon: icon,
    allowOutsideClick: required,
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Ok!"
  }).then((result) => {
    if (result.isConfirmed) {
      path
    }
  });
}


export function setPagination(
  callService: (page: number, searchTerm: any, startDate?: any, endDate?: any) => Observable<any>,
  page: number = 1,
  searchTerm: any,
  setState: (...args: any[]) => void,
  startDate?: any,
  endDate?: any,
  onError?: (error: any) => void
): Subscription {
  return callService(page, searchTerm, startDate, endDate).subscribe({
    next: (data: any) => {
      setState({
        listItems: data?.listItems,
        nberItems: data?.nberItems,
        nextPage: data?.nextPage,
        previousPage: data?.previousPage,
        currentPage: data?.currentPage,
        page_size: data?.page_size,
        nber_pages: data?.nber_pages,
        otherParams: data?.other_params,
      });
    },
    error: (err: any) => {
      onError?.(err); // call optional handler
    }
  });
}

export const roles = [
  {name:"Administrateur", value:"Admin"},
  {name:"Comptable", value:"Daf"},
  {name:"Entrepreneur agricole", value:"Agricultural"},
]

export const listDonors = [
  {name:"Organisation internationale", value:"international"},
  {name:"État / Gouvernement", value:"state"},
  {name:"ONG", value:"ngo"},
  {name:"Secteur privé", value:"private"},
  {name:"bank", value:"Banque"},
  {name:"Autre", value:"other"},
]

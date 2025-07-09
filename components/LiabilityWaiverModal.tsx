"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface LiabilityWaiverModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LiabilityWaiverModal({ isOpen, onClose }: LiabilityWaiverModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900"
                  >
                    Liability Waiver
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto text-sm text-gray-700 space-y-4">
                  <p>
                    I am voluntarily participating in physical exercise that can be strenuous and subject to risk of serious injury during 
                    PRIVATE, GROUP, and VIDEO TRAINING. Holistic Mechanics, INC, Yoga for PE, and its Educators and Trainers urge you to 
                    obtain a physical examination from a doctor before beginning any exercise or training program. You agree that by 
                    participating in these physical exercise sessions, yoga sessions, personal training sessions and other activities and 
                    lessons at your own risk. I recognize that exercise is not without some risk to the musculoskeletal system (e.g. sprain, 
                    strain) and cardiorespiratory system (e.g. dizziness, fainting, abnormal heartbeat, discomfort in breathing, abnormal 
                    blood pressure response, and in rare instances, heart attack or stroke). I acknowledge that not all risks can be known in 
                    advance.
                  </p>

                  <p>
                    I HEREBY, for myself, my heirs, executors, administrators, assigns, or personal representatives (hereinafter collectively, 
                    "Releasor," "I" or "me", which terms shall also include Releasor's parents or guardian if Releasor is under 18 years of age), 
                    knowingly and voluntarily enter into this WAIVER AND RELEASE OF LIABILITY and hereby waive any and all rights, claims 
                    or causes of action of any kind arising out of my participation in any personal training, yoga, and group exercise 
                    sessions.
                  </p>

                  <p>
                    I HEREBY release and forever discharge Holistic Mechanics, INC, Yoga for PE, its Educators, Trainers and their affiliates, 
                    managers, members, agents, attorneys, staff, volunteers, heirs, representatives, predecessors, successors and 
                    assigns (collectively "Releasees"), from any physical or psychological injury that I may suffer as a direct result of my 
                    participation in the aforementioned Activities.
                  </p>

                  <p>
                    I FURTHER AGREE to indemnify, defend and hold harmless the Releasees against any and all claims, suits or actions of 
                    any kind whatsoever for liability, damages, compensation or otherwise brought by me or anyone on my behalf, including 
                    attorney fees and any related costs.
                  </p>

                  <p>
                    I FURTHER ACKNOWLEDGE that Releasees are not responsible for errors, omissions, acts or failures to act of any party 
                    or entity conducting a specific event or activity on behalf of Releasees. In the event that I should require medical care 
                    or treatment, I authorize Holistic Mechanics, INC, Yoga for PE, its Educators and Trainers to provide all emergency 
                    medical care deemed necessary, including but not limited to, first aid, CPR, the use of AEDs, emergency medical 
                    transport, and sharing of medical information with medical personnel.
                  </p>

                  <p>
                    I further agree to assume all costs involved and agree to be financially responsible for any costs incurred as a result of 
                    such treatment. I am aware and understand that I should carry my own health insurance. In the event that any damage to 
                    equipment, field or facilities occurs as a result of my or my family's or my agent's willful actions, neglect or 
                    recklessness, I acknowledge and agree to be held liable for any and all costs associated with any such actions of 
                    neglect or recklessness. Both participant and Holistic Mechanics, INC, Yoga for PE, its Trainers and Educators agree 
                    that this agreement is clear and unambiguous as to its terms, and that no other evidence shall be used or admitted 
                    altering or explain the terms of this agreement, but that it will be interpreted based on the language in accordance with 
                    the purposes for which it is entered into.
                  </p>

                  <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Photo/Video Release</h4>

                  <p>
                    I hereby grant Holistic Mechanics INC, Yoga for PE, it's Educators and Trainers permission to use my likeness in a 
                    photograph, video, or other digital media ("photo") in any and all of its publications, including web-based publications, 
                    without payment or other consideration.
                  </p>

                  <p>
                    I understand and agree that all photos will become the property of Holistic Mechanics INC, Yoga for PE, it's Educators 
                    and Trainers and will not be returned.
                  </p>

                  <p>
                    I hereby irrevocably authorize Holistic Mechanics INC, Yoga for PE, it's Educators and Trainers to edit, alter, copy, 
                    exhibit, publish, or distribute these photos for any lawful purpose. In addition, I waive any right to inspect or approve the 
                    finished product wherein my likeness appears. Additionally, I waive any right to royalties or other compensation arising 
                    or related to the use of the photo.
                  </p>

                  <p>
                    I hereby hold harmless, release, and forever discharge Holistic Mechanics INC, Yoga for PE, it's Educators and 
                    Trainers from all claims, demands, and causes of action which I, my heirs, representatives, executors, administrators, or 
                    any other persons acting on my behalf or on behalf of my estate have or may have by reason of this authorization.
                  </p>

                  <p className="font-semibold">
                    I HAVE READ AND UNDERSTAND THE ABOVE PHOTO RELEASE. I AFFIRM THAT I AM AT LEAST 18 YEARS OF AGE, OR, IF 
                    I AM UNDER 18 YEARS OF AGE, I HAVE OBTAINED THE REQUIRED CONSENT OF MY PARENTS/GUARDIANS AS 
                    EVIDENCED BY THEIR SIGNATURES BELOW. I ACCEPT:
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

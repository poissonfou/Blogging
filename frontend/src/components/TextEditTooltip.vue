<template>
  <div class="tooltip-body hidden">
    <button @click="styleText('b')" title="bold">
      <b>B</b>
    </button>
    <button @click="styleText('i')" title="italic">
      <i>I</i>
    </button>
  </div>
</template>

<script>
let indexesSelections = [];
let idxSelCorrected = [];

export default {
  methods: {
    merge(left, right) {
      let results = [];
      let i = 0,
        j = 0;

      while (i < left.length && j < right.length) {
        if (left[i].start < right[j].start) {
          results.push(left[i]);
          i++;
        } else {
          results.push(right[j]);
          j++;
        }
      }

      while (i < left.length) {
        results.push(left[i]);
        i++;
      }

      while (j < right.length) {
        results.push(right[j]);
        j++;
      }

      return results;
    },
    mergeSort(arr) {
      if (arr.length <= 1) return arr;

      const mid = Math.floor(arr.length / 2);
      const left = this.mergeSort(arr.slice(0, mid));
      const right = this.mergeSort(arr.slice(mid));

      return this.merge(left, right);
    },
    getSelectionRange(element) {
      let start = 0,
        end = 0;
      let sel, range, priorRange;
      if (typeof window.getSelection != "undefined") {
        range = window.getSelection().getRangeAt(0);
        priorRange = range.cloneRange();
        priorRange.selectNodeContents(element);
        priorRange.setEnd(range.startContainer, range.startOffset);
        start = priorRange.toString().length;
        end = start + range.toString().length;
      } else if (
        typeof document.selection != "undefined" &&
        (sel = document.selection).type != "Control"
      ) {
        range = sel.createRange();
        priorRange = document.body.createTextRange();
        priorRange.moveToElementText(element);
        priorRange.setEndPoint("EndToStart", range);
        start = priorRange.text.length;
        end = start + range.text.length;
      }

      return { start, end };
    },
    styleText(el) {
      const textBody = document.getElementById("body");
      const tooltip = document.getElementById("tooltip");
      const text = textBody.innerHTML;

      let { start, end } = this.getSelectionRange(textBody);

      //checks for selection crossing already edited area;
      for (let i = 0; i < indexesSelections.length; i++) {
        if (
          (start > indexesSelections[i].start &&
            start < indexesSelections[i].end) ||
          (end > indexesSelections[i].start && end < indexesSelections[i].end)
        )
          return;
      }

      //checks for repeated selection.
      const idxRepeatedEntry = indexesSelections
        .map((el) => el.start)
        .indexOf(start);

      if (
        idxRepeatedEntry !== -1 &&
        indexesSelections[idxRepeatedEntry].el == el
      ) {
        indexesSelections.splice(idxRepeatedEntry, 1);
      } else {
        indexesSelections.push({ start, end, el });
      }

      //checks for overarching selection.
      indexesSelections = this.mergeSort(indexesSelections);
      idxSelCorrected = JSON.parse(JSON.stringify([...indexesSelections]));

      let i = 0;
      while (i < indexesSelections.length) {
        if (
          indexesSelections[i].start == indexesSelections[i + 1]?.start &&
          indexesSelections[i].end == indexesSelections[i + 1]?.end
        ) {
          idxSelCorrected[i].start = indexesSelections[i].start + 7 * i;
          idxSelCorrected[i].end = indexesSelections[i].end + 7 * i;
          idxSelCorrected[i + 1].start = indexesSelections[i].start + 3;
          idxSelCorrected[i + 1].end = indexesSelections[i].end + 7;
          i++;
          i++;
        } else {
          if (
            start < indexesSelections[i].start &&
            end > indexesSelections.end
          ) {
            idxSelCorrected[i].start = indexesSelections[i].start + 7 * i + 3;
            idxSelCorrected[i].end = indexesSelections[i].end + 7 * i + 3;
          } else {
            idxSelCorrected[i].start = indexesSelections[i].start + 7 * i;
            idxSelCorrected[i].end = indexesSelections[i].end + 7 * i;
          }
          i++;
        }
      }

      let finalHTML = text;

      finalHTML = text
        .replaceAll("<b>", "")
        .replaceAll("</b>", "")
        .replaceAll("<i>", "")
        .replaceAll("<i>", "");

      let leftTextContent;
      let rightTextContent;

      for (let i = 0; i <= idxSelCorrected.length - 1; i++) {
        leftTextContent = "";
        rightTextContent = "";
        let selectedText = finalHTML.slice(
          idxSelCorrected[i].start,
          idxSelCorrected[i].end
        );
        selectedText =
          `<${idxSelCorrected[i].el}>` +
          selectedText +
          `</${idxSelCorrected[i].el}>`;

        if (idxSelCorrected[i].start !== 0)
          leftTextContent = finalHTML.slice(0, idxSelCorrected[i].start);
        if (idxSelCorrected[i].end !== finalHTML.length)
          rightTextContent = finalHTML.slice(idxSelCorrected[i].end);

        finalHTML = leftTextContent + selectedText + rightTextContent;
      }

      textBody.innerHTML = finalHTML;
      tooltip.classList.add("hidden");
    },
  },
};
</script>

<style scoped>
.tooltip-body {
  position: absolute;
  padding: 0.2em;
  background-color: rgb(53, 219, 109);
  font-family: "Zilla Slab", serif;
  font-size: 1.5rem;
  border: solid 2px black;
  border-radius: 3px;
  opacity: 1;
  transition: opacity 0.5s;
  z-index: 600;
}

.hidden {
  opacity: 0;
}

.tooltip-body button {
  font-family: "Zilla Slab", serif;
  font-size: 1.5rem;
  background-color: transparent;
  border: none;
  width: 1.5em;
  text-align: center;
  border-radius: 3px;
  transition: 0.5s;
}

.tooltip-body span {
  margin-right: 0.2em;
}

.tooltip-body button:hover {
  cursor: pointer;
  background-color: rgb(51, 196, 99);
  transition: 0.5s;
}
</style>

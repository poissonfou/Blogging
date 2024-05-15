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
let timesTagsWereAdded = { count: 0, firstElement: -1 };
let indexesSelections = [];

export default {
  methods: {
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

      if (
        start > timesTagsWereAdded.firstElement &&
        timesTagsWereAdded.firstElement !== -1
      ) {
        start = start + 7 * timesTagsWereAdded.count;
        end = end + 7 * timesTagsWereAdded.count;
      }

      if (
        start < timesTagsWereAdded.firstElement ||
        timesTagsWereAdded.firstElement == -1
      )
        timesTagsWereAdded.firstElement = start;

      timesTagsWereAdded.count++;

      return { start, end };
    },
    styleText(el) {
      const textBody = document.getElementById("body");
      const text = textBody.innerHTML;

      let { start, end } = this.getSelectionRange(textBody);
      const idxRepeatedEntry = indexesSelections
        .map((el) => el.start)
        .indexOf(start);

      if (idxRepeatedEntry !== -1) {
        indexesSelections.splice(idxRepeatedEntry, 1);
      }

      console.log("start " + start, "end " + end);

      for (let i = 0; i < indexesSelections.length; i++) {
        if (
          start - 7 > indexesSelections[i].start &&
          start - 7 < indexesSelections[i].end
        ) {
          console.log("hwew");
          indexesSelections[i].end = start - 7;
        }

        if (
          end > indexesSelections[i].start &&
          start < indexesSelections[i].start &&
          i == 0
        ) {
          console.log("hhhhhhkkkkkk");
          indexesSelections[i].start += 7;
        }

        if (
          end - 7 > indexesSelections[i].start &&
          start - 7 < indexesSelections[i].start
        ) {
          console.log("hhhhhhkkkkkk");
          indexesSelections[i].start = start + 7;
        }
      }

      indexesSelections.push({ start, end, el });

      let finalHTML = text;

      if (indexesSelections.length >= 1) {
        finalHTML = text
          .replaceAll("<b>", "")
          .replaceAll("</b>", "")
          .replaceAll("<i>", "")
          .replaceAll("<i>", "");

        console.log(finalHTML);
      }

      let leftTextContent;
      let rightTextContent;

      for (let i = 0; i <= indexesSelections.length - 1; i++) {
        leftTextContent = "";
        rightTextContent = "";
        let selectedText = finalHTML.slice(
          indexesSelections[i].start,
          indexesSelections[i].end
        );
        selectedText =
          `<${indexesSelections[i].el}>` +
          selectedText +
          `</${indexesSelections[i].el}>`;

        if (indexesSelections[i].start !== 0)
          leftTextContent = finalHTML.slice(0, indexesSelections[i].start);
        if (indexesSelections[i].end !== finalHTML.length)
          rightTextContent = finalHTML.slice(indexesSelections[i].end);
        finalHTML = leftTextContent + selectedText + rightTextContent;
        console.log(finalHTML);
      }

      textBody.innerHTML = finalHTML;
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

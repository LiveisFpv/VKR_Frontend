<script setup lang="ts">
</script>

<template>
<div class="chat">
    <div class="messages">
        <div class="message-user">
            <p>Machine learning</p>
        </div>
        <div class="message-chat">
            <p>Relevant Papers:</p>
            <a href="#">Machine learning in computer scince</a>
        </div>
    </div>
    <div class="prompt">
        <label for="prompt"></label>
        <input type="text" name="prompt" id="prompt" placeholder="Начните писать">
    </div>
</div>
</template>

<style scoped>
.chat, .prompt{
    display: flex;
    flex-direction: column;
    width: 100%;
}
.chat{
    padding-top: 20px;
    border: 2px solid #333;
    border-radius: 20px;
    height: 100%;
    overflow-y: hidden;
    justify-content: space-between;
}
.messages{
    padding-left: 20px;
    padding-right: 20px;
    display: flex;
    flex-direction: column;
    gap: 30px;
}
.message-user{
    border: #444 2px solid;
    border-radius: 12px;
    border-bottom-right-radius: 0px;
    padding: 15px;
    text-align: right;
    max-width: 48%;
    display: flex;
    justify-content: right;
    flex-direction: column;
    align-self: flex-end
}
.message-chat{
    border: #444 2px solid;
    border-radius: 12px;
    border-bottom-left-radius: 0px;
    padding: 15px;
    text-align: left;
    max-width: 48%;
    display: flex;
    justify-content: left;
    flex-direction: column;
}
input{
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
    border-bottom-left-radius: 20px;
    padding: 13px;
    font-size: 18px;
    border: none;
}
</style>
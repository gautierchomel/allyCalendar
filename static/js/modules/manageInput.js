let manageInput = `<label>
            <span>Name</span>
                <input placeholder="Elizabeth Caslon" type="text" name="username" value="${event.username != null ? event.username : ''}" />
                    </label>
                    <label>
                        <span>email</span>
                        <input placeholder="not filled" type="email" name="usermail"  value="${event.usermail != null ? event.usermail : ''}" />
                    </label>
                    <label>
                        <span>Title</span>
                        <input placeholder="not filled" type="text" name="title" value="${event.title}"/>
                    </label>
                    <label>
                        <span>Keywords</span>
                        <input type="text" name="tags" placeholder="eg Open Content, Open Software, Open Childrens Books, Micropublications, Open Access, etc." value="${event.tags}" />
                    </label> 
                    ${event.images.length > 0 && event.images.ext != '.bin' ? '<label><span>Associated image <br /><img loading="lazy" src="' + server + event.images[0].url + '"/><br /></label>' : '<label><span>Associated image </span><br /><input id="images" type="file" name="files.images" /></label>'}
                    
                    
                    <label>
                        <span>Participants</span>
                        <input type="text" name="participant" value="${event.participant}"/>
                    </label>
                    <label>
                        <span>Description</span>
                        <textarea placeholder="" name="description">${event.description}</textarea>
                    </label>
                    <label>
                        <span>Language</span>
                        <input placeholder="esperanto" type="text" name="language" value="${event.language}"/>
                    </label>
                    <label>
                        <span>Public Link to Stream, Video Conference, etc.:</span>
                        <input name="url" type="text" placeholder="https://www.something.service" value="${event.url}"/>
                    </label>
                    <label>
                        <span>Date <small>(YYYY-MM-DD)</small></span>
                        <input type="date" name="date" value="${event.date}" />
                    </label>
                    <label>
                        <span>Time <small>(HH:SS)</small></span>
                        <input type="time" name="time" value="${event.time}" />
                    </label>
                    <label>
                    <span>Timezone</span>
                    <select name="timezone" id="timezoneSelect" >
                    <option selected>${event.timezone}</option>
                        ${timezoneoptions}
                    </select>
                </label>
                    
                <label>
                    <span>archive link</span>
                    <input type="text" name="archiveLink" value="${event.archivelink}" />
                 
                    </div>
                    <div class="controls">
                    <button onclick="update(${event.id}, this)" class="update">update data</button>
                    </div>
</li>`

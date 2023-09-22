import { Image, Button, Form, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom'; //abilitare react-router
import { useState } from 'react';

function MyMemeCreator(props) {
    // Creation Mode: receive (patterns | setDirty)                -> it creates a new meme using <patterns>
    // Copying Mode:  receive (meme, pattern, creator | setDirty)  -> it copies a <meme> using its <memepattern>
    const [image, setImage] = useState(props.meme !== undefined ?               /*Copying Mode*/ props.meme['patternid']       : /*Creation Mode*/  0);
    const [title, setTitle] = useState(props.meme !== undefined ?               /*Copying Mode*/ props.meme['title']           : /*Creation Mode*/ '');
    const [isprotected, setIsprotected] = useState(props.meme !== undefined ?   /*Copying Mode*/ props.meme['protected']       : /*Creation Mode*/ false);
    const [textballoons, setTextballoons] = useState(props.meme !== undefined ? /*Copying Mode*/ props.meme['text'].split(";") : /*Creation Mode*/
        getPattern(0)['coordinates_full'].split(";").map(
            (a) => { return "[Text]" }  //array of text balloons initialized to "[Text]"
        ));
    const [pattern, setPattern] = useState(props.meme !== undefined ?           /*Copying Mode*/ props.pattern                 : /*Creation Mode*/ getPattern(0));
    const [color, setColor] = useState(props.meme !== undefined ?               /*Copying Mode*/ props.meme['color']           : /*Creation Mode*/ 'black');
    const [font, setFont] = useState(props.meme !== undefined ?                 /*Copying Mode*/ props.meme['font']            : /*Creation mode*/ 'arial');
    const [error, setError] = useState('');

    function getPattern(patternid_and_imagename){
        return props.patterns.find((pattern) => {
            //find the pattern with the same pattenid of "image"
            if (parseInt(pattern['patternid_and_imagename']) === parseInt(patternid_and_imagename)) { return true; } else { return false; }
        })
    }

    //Add text balloon to the list of balloons
    function addTextBalloon(input_text, boxnumber) {
        let new_textballoons = [];
        boxnumber = parseInt(boxnumber);
        setError('');

        if (input_text === "") input_text = "[Text]";
        //rebuild the balloon array (eventually with a new text)
        for (let loop_counter = 0; loop_counter < textballoons.length; loop_counter++) {
            if (loop_counter === boxnumber) {
                new_textballoons.push(input_text);
            } else {
                new_textballoons.push(textballoons[loop_counter]);
            }
        }

        setTextballoons(new_textballoons);
    }

    //Change Image and reload Balloons boxes
    function switchImage(new_patternid_and_imagename) {
        setImage(new_patternid_and_imagename);

        let new_pattern = getPattern(new_patternid_and_imagename);
        setPattern(new_pattern);

        let new_balloons_array = new_pattern['coordinates_full'].split(";").map(
            (el,index) => {
                if(textballoons[index]===undefined 
                    || textballoons[index]===null
                    //when we switch from a less balloons meme to a more balloons meme, the textballons array is built
                    //with more items then before, so the new items are "undefined" or "null", we have to initialize them to "[Text]"
                    ) return "[Text]" 

                else return textballoons[index]; }  //array of text balloons initialized to "[Text]"
        );
        setTextballoons(new_balloons_array);
    }

    //Validate text and send
    async function handleSave() {
        setError('');
        
        if (title === '') { //check if there is a title
            setError("You must write a title"); return;
        }
        
        if (title.length > 48) { //check if there is a title
            setError("You cannot use more than 100 characters for the title"); return;
        }
        
        if (textballoons.some((el) => { if (el !== "[Text]") {return true;}else{return false;} }) === false) {
            //check if there is at least one text balloon 
            setError("You must write at least one balloon text"); return;
        }
        
        if (textballoons.some((el) => { if (el.length > 70) {return true;}else{return false;} }) === true) {
            //check if there is at least one text balloon 
            setError("You cannot use more than 70 characters in a balloon"); return;
        }
        
        //stringify the balloons text array & cleaning empty text balloons (from "[Text]" to "")
        let final_textballoons = textballoons.map(
            (textballoon)=>{
                if(textballoon==="[Text]"){
                    return "";
                }else{
                    return textballoon;
                }
            
            });
        final_textballoons = final_textballoons.join(";");
        
        //build new meme
        let new_meme = {
            "patternid": image,
            "title": title,
            "text": final_textballoons,
            "font": font,
            "color": color,
            "protected": isprotected,
        }

        //send new meme to server
        props.addMeme(new_meme);
    }

    let balloons = [], loop_balloons_counter = -1, text_boxes_counter = -1;
    
    for (let balloon of pattern['coordinates_full'].split(";")) { //it loops all balloons
        let balloon_field = balloon.split(",");

        balloons.push({
            //coordinates ordered as in DB
            "maxHeight": parseInt(balloon_field[0]),
            "maxWidth": parseInt(balloon_field[1]),
            "left": parseInt(balloon_field[2]),
            "right": parseInt(balloon_field[3]),
            "top": parseInt(balloon_field[4]),
            "bottom": parseInt(balloon_field[5]),
            "fontSize": parseInt(balloon_field[6])
        });
    }



    return (<>

        {props.meme===undefined? 
            <div className="my-3"><h2>Meme Creator</h2></div>/*Creator Mode*/
        :
            <div className="my-3"><h2>Meme Copier</h2></div>/*Copying Mode*/
        }
        
        <div style={{ height: 700, width: 700, position: "relative", margin: "auto" }}>
            <Form>
                {/*----TITLE----*/}
                <Form.Group className="my-2">
                    <Form.Label style={{ fontWeight: 'bold' }}>Title</Form.Label>
                    <Form.Control onChange={ev => { setTitle(ev.target.value === "" ? "" : ev.target.value);}} placeholder="Meme Title" 
                    defaultValue={props.meme ===undefined? "":props.meme['title']}/>
                </Form.Group>

                {/*----IMAGE----*/}
                <div style={{ fontWeight: 'bold' }}>Image</div>
                <div className="my-2" style={{ height: 500, width: 500, position: "relative", margin: "auto" }}>
                    <Image style={{ height: "100%", width: "100%" }} src={"./meme_images/meme_" + image + ".jpg"} rounded></Image>

                    {/*----BALLOONS----*/}
                    {balloons.map((balloon, index) => {
                        loop_balloons_counter++;
                        return (
                            <div key={index} style={{
                                //coordinates ordered as in DB
                                maxHeight: balloon["maxHeight"],
                                maxWidth: balloon["maxWidth"],
                                left: balloon["left"],
                                right: balloon["right"],
                                top: balloon["top"],
                                bottom: balloon["bottom"],
                                fontSize: balloon["fontSize"],
                                fontFamily: font,
                                color: color,

                                fontWeight: "bold",
                                fontStyle: "italic",
                                wordWrap: "break-word",
                                overflow: "hidden",
                                position: "absolute"
                            }}>
                                {textballoons[loop_balloons_counter]}
                            </div>
                        )
                    })}
                </div>

                {/*----IMAGE SWITCHER----*/}
                {props.meme === undefined ? 
                        /*Creation Mode*/
                    <Form.Control as="select" className="my-2" required
                        onChange={ev => { switchImage(ev.target.value) }} custom>
                        {props.patterns.map((pattern,index) => {
                            return (<option key={index} value={parseInt(pattern['patternid_and_imagename'])}>Image_{pattern['patternid_and_imagename']}</option>)
                        })}
                    </Form.Control>
                :       /*Copying Mode*/
                    <Form.Control as="select" className="my-2" disabled custom>
                        <option value= {image}> Image_{image}</option>
                    </Form.Control>
                }

                {/*----TEXT BOXES----*/}
                {textballoons.map((el,index) => {
                    text_boxes_counter++;
                    return (
                        <div key={index}>
                            <Form.Group className="my-2">
                                <Form.Label style={{ fontWeight: 'bold' }}>Balloon Text {text_boxes_counter}</Form.Label>
                                <Form.Control id={String(text_boxes_counter)} as="textarea" placeholder={"Balloon Text"} rows={2}
                                    defaultValue={props.meme===undefined ? "": textballoons[text_boxes_counter]}
                                    onChange={ev => {
                                        addTextBalloon(ev.target.value === "" ? "[Text]" : ev.target.value, ev.target.id)
                                    }} />
                            </Form.Group>
                        </div>
                    )
                })}

                {/*----COLOR & FONT SELECTION----*/}
                <div style={{ fontWeight: 'bold' }}>Font</div>
                <div key={`inline-radio-font`} className="mb-3">
                    <Form.Check inline label="arial" defaultChecked={(props.meme!==undefined && props.meme['font']==="arial")? true : (props.meme!==undefined? false: true)} type={"radio"} name="group1" onChange={ev => { setFont("arial") }} />
                    <Form.Check inline label="comicsans" defaultChecked={(props.meme!==undefined && props.meme['font']==="comicsans")? true : (props.meme!==undefined? false: false)} type={"radio"} name="group1" onChange={ev => { setFont("comicsans") }} />
                </div>
                <div style={{ fontWeight: 'bold' }}>Color</div>
                <div key={`inline-radio-colors`} className="mb-3">
                    <Form.Check defaultChecked={(props.meme!==undefined && props.meme['color']==="black")? true : (props.meme!==undefined? false: true)} inline label="black" name="group2" type={"radio"} onChange={ev => { setColor("black") }} />
                    <Form.Check defaultChecked={(props.meme!==undefined && props.meme['color']==="red")? true : (props.meme!==undefined? false: false)} inline label="red" name="group2" type={"radio"} onChange={ev => { setColor("red") }} />
                    <Form.Check defaultChecked={(props.meme!==undefined && props.meme['color']==="blue")? true : (props.meme!==undefined? false: false)} inline label="blue" name="group2" type={"radio"} onChange={ev => { setColor("blue") }} />
                    <Form.Check defaultChecked={(props.meme!==undefined && props.meme['color']==="green")? true : (props.meme!==undefined? false: false)} inline label="green" name="group2" type={"radio"} onChange={ev => { setColor("green") }} />
                </div>

                {/*----VISIBLITY LEVEL----*/}
                {props.meme === undefined ? 
                /*Creator Mode: you can choose privacy level*/ 
                
                    <Form.Group className="my-2">
                        <Form.Check type="checkbox" label="Protected" onChange={ev => { setIsprotected(ev.target.checked) }} />
                    </Form.Group>

                : (props.meme !== undefined && props.meme['creator_id'] !== props.user_id && props.meme['protected'] ? 
                /*Copying Mode + I'm not the creator + protected meme: you can't choose privacy level */
                
                    <Badge variant={"primary"}>Protected</Badge> 

                :
                /*Copying Mode + any other combination: you can choose privacy*/
                
                    <Form.Group className="my-2">
                        <Form.Check type="checkbox" label="Protected" onChange={ev => { setIsprotected(ev.target.checked) }} />
                    </Form.Group>
                
                )}

                {/*----CREATOR LABEL----*/}
                {props.meme !== undefined ? /*Creator Mode*/
                <div>
                    <div className="pt-3" style={{fontSize: 15 }}>Created by: <b>{props.meme['creator_name']}</b></div>
                </div>
                : /*Copying Mode*/<></>}

                <div className="pt-3 pb-3">
                    {/*----SUBMIT BUTTON----*/}
                    <Button className="mx-2" variant="primary" onClick={handleSave}>Submit</Button>

                    {/*----RETURN BUTTON----*/}
                    <Link to="/"><Button className="mx-2" variant="outline-primary">Back</Button></Link>
                </div>

                {/*----ERROR MESSAGE----*/}
                <div className="pb-3">
                    {error !== "" ?
                        <Alert variant={'danger'} onClose={() => setError("")} dismissible>
                            {error}
                        </Alert> : ''}
                </div>

            </Form>
        </div>
    </>
    )
}

export { MyMemeCreator };
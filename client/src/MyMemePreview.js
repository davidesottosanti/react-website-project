import { Image, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom'; //abilitare react-router

function MyMemePreview(props) {
    //All variables
    let title = props.meme['title'];
    let image = "./meme_images/meme_" + props.pattern['patternid_and_imagename'] + ".jpg";
    let creator_id = props.meme['creator_id'];
    let isprotected = props.meme['protected'];
    let text_array= props.meme['text'].split(";");
    let color= props.meme['status']==="temporary" ? 'black' : props.meme['color'];
    let balloons = [],loop_balloons_counter=-1;
    for (let balloon of props.pattern['coordinates_preview'].split(";")) { //it loops all balloons
        let balloon_field = balloon.split(",");

        balloons.push({
            //coordinates ordered as in DB
            "maxHeight": parseInt(balloon_field[0]),
            "maxWidth": parseInt(balloon_field[1]),
            "left": parseInt(balloon_field[2]),
            "right": parseInt(balloon_field[3]),
            "top": parseInt(balloon_field[4]),
            "bottom": parseInt(balloon_field[5]),
            "fontSize": parseInt(balloon_field[6]),
        });
    }

    const handleDelete = ()=>{
        props.deleteMeme(parseInt(props.meme['id']));
    }
    
    return (<>
        <div className="mt-3 mx-3 mb-5" style={{display: "inline-block" }}>

            <div style={{display: "inline-block", fontWeight: "bold", fontSize: 15, maxWidth:200, maxHeight:100, wordWrap: "normal", overflow: "hidden", whiteSpace: "pre", textOverflow: 'ellipsis'}}>
                {/*PROTECTED BADGE*/}
                {(isprotected && props.meme['status']==="temporary")? /*Temporary meme*/ <Badge className="mr-1" variant="secondary">Protected</Badge>:<></>}
                {(isprotected && props.meme['status']!=="temporary")? /*Real meme*/ <Badge className="mr-1" variant="primary">Protected</Badge>:<></>}
                
                {/*TITLE*/}
                {title}
            </div> 
            
            <div style={{ height: 200, width: 200, position: "relative", margin: "auto" }}>

                {/*IMAGE*/}
                {props.meme['status']==="temporary" ? /*Temporary meme*/
                    <Image style={{ height: "100%", width: "100%", filter: "grayscale(100%)" }} src={image} rounded></Image>
                :                                 /*Real meme*/
                    <Image style={{ height: "100%", width: "100%"}} src={image} rounded></Image>
                }

                {/*BALLOONS*/}
                {balloons.map((balloon,index) => {
                    loop_balloons_counter=loop_balloons_counter+1;
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
                            
                            //coordinates ordered as in DB-savedmeme
                            fontFamily: props.meme["font"],
                            color: color,
                            
                            fontWeight: "bold",
                            fontStyle: "italic",
                            wordWrap: "break-word", 
                            overflow: "hidden",
                            position: "absolute"}}>
                            
                            {text_array[loop_balloons_counter]}
                        </div>
                    )
                })}
                
                
                {props.meme['status']==="temporary" ? /*Temporary meme*/
                    <h6 style={{paddingTop:12}}><Badge pill variant="warning">Synchronizing data..</Badge></h6>
                :                                 /*Real meme*/
                    <div className="mt-2">
                        {/*BUTTONS INFO*/}
                        <Link to={{pathname:"/memeinfo", state:{meme:props.meme, pattern:props.pattern} }}>
                            <Button className="mx-1" size="sm" variant="outline-primary">Info</Button>
                        </Link>
                        
                        {/*BUTTONS CLONE*/}
                        {props.loggedIn===true ?
                        <Link to={{pathname:"/memecopy", state:{meme:props.meme, pattern:props.pattern} }}>
                            <Button className="mx-1" size="sm" variant="outline-success">Copy</Button>
                        </Link>
                        :<></>}
                        
                        {/*BUTTONS DELETE*/}
                        {props.loggedIn===true && creator_id===props.user_id ? 
                            <Button className="mx-1" onClick={handleDelete} size="sm" variant="outline-danger">Delete</Button>
                        :<></>}
                        
                    </div>
                }
                
            </div>
        </div>

    </>
    )
}

export { MyMemePreview };